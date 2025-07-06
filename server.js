require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_electoral',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL - sistema_electoral');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        console.log('💡 Verifica que MySQL esté corriendo y la base de datos "sistema_electoral" exista');
        return false;
    }
}

// Ruta de prueba
app.get('/api/test', async (req, res) => {
    const dbStatus = await testConnection();
    res.json({
        message: 'API funcionando - Sistema Electoral Completo',
        version: '2.0.0',
        database: dbStatus ? 'conectada' : 'error'
    });
});

// Login con base de datos real
app.post('/api/login', async (req, res) => {
    const { cedula } = req.body;

    if (!cedula) {
        return res.status(400).json({ error: 'Cédula es requerida' });
    }

    try {
        // Buscar votante en la base de datos
        const [rows] = await pool.execute(
            'SELECT Cedula, Nombre_completo FROM Votante WHERE Cedula = ?',
            [cedula]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Votante no encontrado' });
        }

        const votante = rows[0];

        // Verificar si ya votó consultando la tabla Votante_voto
        const [votoRows] = await pool.execute(
            'SELECT COUNT(*) as votos FROM Votante_voto WHERE Cedula = ?',
            [cedula]
        );

        const yaVoto = votoRows[0].votos > 0;

        res.json({
            success: true,
            votante: {
                cedula: votante.Cedula,
                nombre: votante.Nombre_completo,
                yaVoto: yaVoto
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener opciones de voto (papeletas activas)
app.get('/api/opciones', async (req, res) => {
    try {
        // Obtener papeletas de elecciones activas
        const [rows] = await pool.execute(`
            SELECT 
                p.Id_papeleta as id,
                p.Color as color,
                CASE 
                    WHEN p.Numero_lista IS NULL THEN 'Voto en Blanco'
                    ELSE CONCAT('Lista ', p.Numero_lista)
                END as nombre,
                CASE 
                    WHEN p.Numero_lista IS NULL THEN 'Abstención'
                    ELSE CONCAT('Lista del partido ', pr.Id_partido)
                END as descripcion
            FROM Papeleta p
            JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
            LEFT JOIN Lista l ON p.Numero_lista = l.Numero
            LEFT JOIN Partido pr ON l.Id_partido = pr.Id_partido
            WHERE e.Esta_activa = TRUE
            ORDER BY p.Id_papeleta
        `);

        res.json({
            success: true,
            opciones: rows
        });

    } catch (error) {
        console.error('Error obteniendo opciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Votar con base de datos real
app.post('/api/votar', async (req, res) => {
    const { cedula, opcionId } = req.body;

    if (!cedula || !opcionId) {
        return res.status(400).json({ error: 'Cédula y opción son requeridas' });
    }

    try {
        // Verificar que el votante existe
        const [votanteRows] = await pool.execute(
            'SELECT Cedula, Id_circuito FROM Votante WHERE Cedula = ?',
            [cedula]
        );

        if (votanteRows.length === 0) {
            return res.status(404).json({ error: 'Votante no encontrado' });
        }

        const votante = votanteRows[0];

        // Verificar que no haya votado antes
        const [votoExistenteRows] = await pool.execute(
            'SELECT COUNT(*) as votos FROM Votante_voto WHERE Cedula = ?',
            [cedula]
        );

        if (votoExistenteRows[0].votos > 0) {
            return res.status(400).json({ error: 'El votante ya emitió su voto' });
        }

        // Verificar que la papeleta existe y está activa
        const [papeletaRows] = await pool.execute(`
            SELECT p.Id_papeleta, p.Color
            FROM Papeleta p
            JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
            WHERE p.Id_papeleta = ? AND e.Esta_activa = TRUE
        `, [opcionId]);

        if (papeletaRows.length === 0) {
            return res.status(400).json({ error: 'Opción inválida o elección no activa' });
        }

        // Verificar que la mesa está abierta
        const [mesaRows] = await pool.execute(
            'SELECT Esta_abierta FROM Estado_mesa WHERE Id_circuito = ?',
            [votante.Id_circuito]
        );

        if (mesaRows.length === 0 || !mesaRows[0].Esta_abierta) {
            return res.status(400).json({ error: 'La mesa electoral está cerrada' });
        }

        // Iniciar transacción
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insertar el voto
            const [votoResult] = await connection.execute(
                'INSERT INTO Voto (Fecha_hora, Observado, Estado, Id_circuito, Id_papeleta) VALUES (NOW(), FALSE, "Válido", ?, ?)',
                [votante.Id_circuito, opcionId]
            );

            const idVoto = votoResult.insertId;

            // Relacionar votante con voto
            await connection.execute(
                'INSERT INTO Votante_voto (Cedula, Id_voto, Fecha_hora) VALUES (?, ?, NOW())',
                [cedula, idVoto]
            );

            // Relacionar voto con papeleta
            await connection.execute(
                'INSERT INTO Voto_papeleta (Id_voto, Id_papeleta) VALUES (?, ?)',
                [idVoto, opcionId]
            );

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: `Voto registrado exitosamente`
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error registrando voto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ver resultados desde base de datos
app.get('/api/resultados', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.Id_papeleta as id,
                p.Color as color,
                CASE 
                    WHEN p.Numero_lista IS NULL THEN 'Voto en Blanco'
                    ELSE CONCAT('Lista ', p.Numero_lista)
                END as nombre,
                CASE 
                    WHEN p.Numero_lista IS NULL THEN 'Abstención'
                    ELSE CONCAT('Lista del partido ', pr.Id_partido)
                END as descripcion,
                COUNT(v.Id_voto) as votos
            FROM Papeleta p
            JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
            LEFT JOIN Lista l ON p.Numero_lista = l.Numero
            LEFT JOIN Partido pr ON l.Id_partido = pr.Id_partido
            LEFT JOIN Voto_papeleta vp ON p.Id_papeleta = vp.Id_papeleta
            LEFT JOIN Voto v ON vp.Id_voto = v.Id_voto AND v.Estado = 'Válido'
            WHERE e.Esta_activa = TRUE
            GROUP BY p.Id_papeleta
            ORDER BY votos DESC, p.Id_papeleta
        `);

        // Calcular total de votos
        const totalVotos = rows.reduce((sum, row) => sum + row.votos, 0);

        // Agregar porcentajes
        const resultados = rows.map(row => ({
            ...row,
            porcentaje: totalVotos > 0 ? ((row.votos / totalVotos) * 100).toFixed(1) : '0.0'
        }));

        res.json({
            success: true,
            resultados,
            totalVotos
        });

    } catch (error) {
        console.error('Error obteniendo resultados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Estadísticas adicionales
app.get('/api/estadisticas', async (req, res) => {
    try {
        const [votantesTotal] = await pool.execute(
            'SELECT COUNT(*) as total FROM Votante'
        );

        const [votosEmitidos] = await pool.execute(
            'SELECT COUNT(*) as total FROM Votante_voto'
        );

        const [ultimosVotos] = await pool.execute(`
            SELECT vv.Fecha_hora, vo.Nombre_completo
            FROM Votante_voto vv
            JOIN Votante vo ON vv.Cedula = vo.Cedula
            ORDER BY vv.Fecha_hora DESC
            LIMIT 5
        `);

        const participacion = votantesTotal[0].total > 0
            ? ((votosEmitidos[0].total / votantesTotal[0].total) * 100).toFixed(1)
            : '0.0';

        res.json({
            success: true,
            estadisticas: {
                votantesTotal: votantesTotal[0].total,
                votosEmitidos: votosEmitidos[0].total,
                participacion: participacion,
                ultimosVotos: ultimosVotos
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Inicializar servidor
async function startServer() {
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.error('❌ No se puede iniciar el servidor sin conexión a la base de datos');
        console.log('💡 Asegúrate de:');
        console.log('   1. Tener MySQL corriendo');
        console.log('   2. Crear la base de datos: CREATE DATABASE sistema_electoral;');
        console.log('   3. Ejecutar el schema.sql');
        console.log('   4. Configurar las credenciales en .env');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
        console.log(`Sistema Electoral Completo funcionando`);
        console.log(`Prueba: http://localhost:${PORT}/api/test`);
        console.log(`Estadísticas: http://localhost:${PORT}/api/estadisticas`);
    });
}

startServer();