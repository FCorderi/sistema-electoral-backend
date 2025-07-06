const { executeQuery } = require('../config/database');

class Voto {
    // Registrar un voto completo (usando transacción)
    static async create(cedulaVotante, idPapeleta, idCircuito) {
        // Esto debería manejarse con transacción en el controlador
        // Aquí solo definimos las queries individuales

        const votoQuery = `
            INSERT INTO Voto (Fecha_hora, Observado, Estado, Id_circuito, Id_papeleta) 
            VALUES (NOW(), FALSE, 'Válido', ?, ?)
        `;

        return await executeQuery(votoQuery, [idCircuito, idPapeleta]);
    }

    // Relacionar votante con voto
    static async linkVotanteVoto(cedula, idVoto) {
        const query = `
            INSERT INTO Votante_voto (Cedula, Id_voto, Fecha_hora) 
            VALUES (?, ?, NOW())
        `;
        return await executeQuery(query, [cedula, idVoto]);
    }

    // Relacionar voto con papeleta
    static async linkVotoPapeleta(idVoto, idPapeleta) {
        const query = `
            INSERT INTO Voto_papeleta (Id_voto, Id_papeleta) 
            VALUES (?, ?)
        `;
        return await executeQuery(query, [idVoto, idPapeleta]);
    }

    // Obtener resultados
    static async getResultados() {
        const query = `
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
        `;
        return await executeQuery(query);
    }

    // Obtener resultados por circuito
    static async getResultadosByCircuito(idCircuito) {
        const query = `
            SELECT 
                p.Id_papeleta as id,
                p.Color as color,
                CASE 
                    WHEN p.Numero_lista IS NULL THEN 'Voto en Blanco'
                    ELSE CONCAT('Lista ', p.Numero_lista)
                END as nombre,
                COUNT(v.Id_voto) as votos
            FROM Papeleta p
            JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
            LEFT JOIN Voto_papeleta vp ON p.Id_papeleta = vp.Id_papeleta
            LEFT JOIN Voto v ON vp.Id_voto = v.Id_voto 
                AND v.Estado = 'Válido' 
                AND v.Id_circuito = ?
            WHERE e.Esta_activa = TRUE
            GROUP BY p.Id_papeleta
            ORDER BY votos DESC, p.Id_papeleta
        `;
        return await executeQuery(query, [idCircuito]);
    }

    // Obtener estadísticas
    static async getEstadisticas() {
        const queries = {
            totalVotantes: 'SELECT COUNT(*) as total FROM Votante',
            totalVotos: 'SELECT COUNT(*) as total FROM Votante_voto',
            ultimosVotos: `
                SELECT vv.Fecha_hora, vo.Nombre_completo
                FROM Votante_voto vv
                JOIN Votante vo ON vv.Cedula = vo.Cedula
                ORDER BY vv.Fecha_hora DESC
                LIMIT 5
            `,
            votosPorCircuito: `
                SELECT 
                    c.Id_circuito,
                    z.Ciudad,
                    z.Barrio,
                    COUNT(v.Id_voto) as total_votos
                FROM Circuito c
                JOIN Zona z ON c.Id_zona = z.Id_zona
                LEFT JOIN Voto v ON c.Id_circuito = v.Id_circuito AND v.Estado = 'Válido'
                GROUP BY c.Id_circuito
                ORDER BY total_votos DESC
            `
        };

        const [totalVotantes, totalVotos, ultimosVotos, votosPorCircuito] = await Promise.all([
            executeQuery(queries.totalVotantes),
            executeQuery(queries.totalVotos),
            executeQuery(queries.ultimosVotos),
            executeQuery(queries.votosPorCircuito)
        ]);

        const participacion = totalVotantes[0].total > 0
            ? ((totalVotos[0].total / totalVotantes[0].total) * 100).toFixed(1)
            : '0.0';

        return {
            totalVotantes: totalVotantes[0].total,
            totalVotos: totalVotos[0].total,
            participacion: participacion,
            ultimosVotos: ultimosVotos,
            votosPorCircuito: votosPorCircuito
        };
    }

    // Verificar si una mesa está abierta
    static async isMesaAbierta(idCircuito) {
        const query = `
            SELECT Esta_abierta 
            FROM Estado_mesa 
            WHERE Id_circuito = ?
        `;
        const result = await executeQuery(query, [idCircuito]);
        return result.length > 0 ? result[0].Esta_abierta : false;
    }

    // Obtener votos observados
    static async getVotosObservados() {
        const query = `
            SELECT 
                v.Id_voto,
                v.Fecha_hora,
                v.Estado,
                vo.Nombre_completo as votante,
                c.Id_circuito,
                z.Ciudad,
                z.Barrio
            FROM Voto v
            JOIN Circuito c ON v.Id_circuito = c.Id_circuito
            JOIN Zona z ON c.Id_zona = z.Id_zona
            LEFT JOIN Votante_voto vv ON v.Id_voto = vv.Id_voto
            LEFT JOIN Votante vo ON vv.Cedula = vo.Cedula
            WHERE v.Observado = TRUE
            ORDER BY v.Fecha_hora DESC
        `;
        return await executeQuery(query);
    }
}

module.exports = Voto;