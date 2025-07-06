const { executeQuery } = require('../config/database');

class Papeleta {
    // Obtener todas las papeletas de elecciones activas
    static async getAll() {
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
                l.Numero as numero_lista,
                pr.Id_partido
            FROM Papeleta p
            JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
            LEFT JOIN Lista l ON p.Numero_lista = l.Numero
            LEFT JOIN Partido pr ON l.Id_partido = pr.Id_partido
            WHERE e.Esta_activa = TRUE
            ORDER BY p.Id_papeleta
        `;
        return await executeQuery(query);
    }

    // Buscar papeleta por ID
    static async findById(id) {
        const query = `
            SELECT 
                p.Id_papeleta,
                p.Color,
                p.Id_eleccion,
                p.Numero_lista,
                e.Esta_activa
            FROM Papeleta p
            JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
            WHERE p.Id_papeleta = ?
        `;
        const result = await executeQuery(query, [id]);
        return result.length > 0 ? result[0] : null;
    }

    // Obtener papeletas con información detallada de candidatos
    static async getPapeletasConCandidatos() {
        const query = `
            SELECT 
                p.Id_papeleta as id,
                p.Color as color,
                CASE 
                    WHEN p.Numero_lista IS NULL THEN 'Voto en Blanco'
                    ELSE CONCAT('Lista ', p.Numero_lista)
                END as nombre,
                l.Numero as numero_lista,
                pr.Id_partido,
                pol.Cedula as cedula_politico,
                v.Nombre_completo as nombre_candidato
            FROM Papeleta p
            JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
            LEFT JOIN Lista l ON p.Numero_lista = l.Numero
            LEFT JOIN Partido pr ON l.Id_partido = pr.Id_partido
            LEFT JOIN Politico pol ON l.Cedula_politico_apoyado = pol.Cedula
            LEFT JOIN Votante v ON pol.Cedula = v.Cedula
            WHERE e.Esta_activa = TRUE
            ORDER BY p.Id_papeleta
        `;
        return await executeQuery(query);
    }

    // Crear nueva papeleta
    static async create(idPapeleta, color, idEleccion, numeroLista = null) {
        const query = `
            INSERT INTO Papeleta (Id_papeleta, Color, Id_eleccion, Numero_lista) 
            VALUES (?, ?, ?, ?)
        `;
        return await executeQuery(query, [idPapeleta, color, idEleccion, numeroLista]);
    }

    // Obtener papeletas por elección
    static async getByEleccion(idEleccion) {
        const query = `
            SELECT 
                Id_papeleta as id,
                Color as color,
                Numero_lista
            FROM Papeleta
            WHERE Id_eleccion = ?
            ORDER BY Id_papeleta
        `;
        return await executeQuery(query, [idEleccion]);
    }
}

module.exports = Papeleta;