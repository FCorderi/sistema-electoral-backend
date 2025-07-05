const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Base de datos simulada en memoria
const votantes = [
    { cedula: '12345678', nombre: 'Juan Pérez', yaVoto: false },
    { cedula: '87654321', nombre: 'María González', yaVoto: false },
    { cedula: '11111111', nombre: 'Carlos Rodríguez', yaVoto: false }
];

const opciones = [
    { id: 1, nombre: 'Candidato A', descripcion: 'Propuesta A', votos: 0 },
    { id: 2, nombre: 'Candidato B', descripcion: 'Propuesta B', votos: 0 },
    { id: 3, nombre: 'Voto en Blanco', descripcion: 'Abstención', votos: 0 }
];

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API funcionando - Iteración 1',
        version: '1.0.0'
    });
});

// Login básico
app.post('/api/login', (req, res) => {
    const { cedula } = req.body;

    if (!cedula) {
        return res.status(400).json({ error: 'Cédula es requerida' });
    }

    const votante = votantes.find(v => v.cedula === cedula);

    if (!votante) {
        return res.status(404).json({ error: 'Votante no encontrado' });
    }

    res.json({
        success: true,
        votante: {
            cedula: votante.cedula,
            nombre: votante.nombre,
            yaVoto: votante.yaVoto
        }
    });
});

// Obtener opciones de voto
app.get('/api/opciones', (req, res) => {
    res.json({
        success: true,
        opciones: opciones
    });
});

// Votar
app.post('/api/votar', (req, res) => {
    const { cedula, opcionId } = req.body;

    // Buscar votante
    const votante = votantes.find(v => v.cedula === cedula);
    if (!votante) {
        return res.status(404).json({ error: 'Votante no encontrado' });
    }

    // Verificar si ya votó
    if (votante.yaVoto) {
        return res.status(400).json({ error: 'El votante ya emitió su voto' });
    }

    // Buscar opción
    const opcion = opciones.find(o => o.id === opcionId);
    if (!opcion) {
        return res.status(400).json({ error: 'Opción inválida' });
    }

    // Registrar voto
    opcion.votos++;
    votante.yaVoto = true;

    res.json({
        success: true,
        message: `Voto registrado para ${opcion.nombre}`
    });
});

// Ver resultados
app.get('/api/resultados', (req, res) => {
    const totalVotos = opciones.reduce((sum, o) => sum + o.votos, 0);

    const resultados = opciones.map(opcion => ({
        ...opcion,
        porcentaje: totalVotos > 0 ? ((opcion.votos / totalVotos) * 100).toFixed(1) : 0
    }));

    res.json({
        success: true,
        resultados,
        totalVotos
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Sistema básico funcionando`);
    console.log(`Prueba: http://localhost:${PORT}/api/test`);
});