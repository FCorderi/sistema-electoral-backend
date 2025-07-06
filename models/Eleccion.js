const { executeQuery } = require('../config/database');

class Eleccion {
    // Obtener todas las elecciones
    static async getAll() {
        const query = `
            SELECT 
                Id_eleccion,
                Fecha,
                Esta_activa
            FROM Eleccion
            ORDER BY Fecha DESC
        `;
        return await executeQuery(query);
    }

    // Obtener elección activa
    static async getActiva() {
        const query = `
            SELECT 
                Id_eleccion,
                Fecha,
                Esta_activa
            FROM Eleccion
            WHERE Esta_activa = TRUE
            LIMIT 1
        `;
        const result = await executeQuery(query);
        return result.length > 0 ? result[0] : null;
    }

    // Buscar elección por ID
    static async findById(id) {
        const query = `
            SELECT 
                Id_eleccion,
                Fecha,
                Esta_activa
            FROM Eleccion
            WHERE Id_eleccion = ?
        `;
        const result = await executeQuery(query, [id]);
        return result.length > 0 ? result[0] : null;
    }

    // Activar elección
    static async activar(id) {
        // Primero desactivar todas las elecciones
        await executeQuery('UPDATE Eleccion SET Esta_activa = FALSE');

        // Luego activar la seleccionada
        const query = `
            UPDATE Eleccion 
            SET Esta_activa = TRUE 
            WHERE Id_eleccion = ?
        `;
        return await executeQuery(query, [id]);
    }

    // Desactivar elección
    static async desactivar(id) {
        const query = `
            UPDATE Eleccion 
            SET Esta_activa = FALSE 
            WHERE Id_eleccion = ?
        `;
        return await executeQuery(query, [id]);
    }

    // Crear nueva elección
    static async create(fecha, estaActiva = false) {
        const query = `
            INSERT INTO Eleccion (Fecha, Esta_activa) 
            VALUES (?, ?)
        `;
        return await executeQuery(query, [fecha, estaActiva]);
    }

    // Verificar si es elección presidencial
    static async isPresidencial(id) {
        const query = `
            SELECT COUNT(*) as es_presidencial
            FROM Eleccion_presidencial
            WHERE Id_eleccion = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0].es_presidencial > 0;
    }

    // Verificar si es elección municipal
    static async isMunicipal(id) {
        const query = `
            SELECT COUNT(*) as es_municipal
            FROM Eleccion_municipal
            WHERE Id_eleccion = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0].es_municipal > 0;
    }

    // Verificar si es ballotage
    static async isBallotage(id) {
        const query = `
            SELECT COUNT(*) as es_ballotage
            FROM Eleccion_ballotage
            WHERE Id_eleccion = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0].es_ballotage > 0;
    }

    // Verificar si es plebiscito
    static async isPlebiscito(id) {
        const query = `
            SELECT COUNT(*) as es_plebiscito
            FROM Eleccion_plebicito
            WHERE Id_eleccion = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0].es_plebiscito > 0;
    }

    // Verificar si es referendum
    static async isReferendum(id) {
        const query = `
            SELECT COUNT(*) as es_referendum
            FROM Eleccion_referendum
            WHERE Id_eleccion = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0].es_referendum > 0;
    }

    // Obtener tipo de elección
    static async getTipo(id) {
        const tipos = await Promise.all([
            this.isPresidencial(id),
            this.isMunicipal(id),
            this.isBallotage(id),
            this.isPlebiscito(id),
            this.isReferendum(id)
        ]);

        if (tipos[0]) return 'Presidencial';
        if (tipos[1]) return 'Municipal';
        if (tipos[2]) return 'Ballotage';
        if (tipos[3]) return 'Plebiscito';
        if (tipos[4]) return 'Referendum';
        return 'General';
    }

    // Obtener estadísticas de la elección activa
    static async getEstadisticasActiva() {
        const eleccionActiva = await this.getActiva();
        if (!eleccionActiva) return null;

        const query = `
            SELECT 
                COUNT(DISTINCT p.Id_papeleta) as total_papeletas,
                COUNT(DISTINCT l.Numero) as total_listas,
                COUNT(DISTINCT pr.Id_partido) as total_partidos
            FROM Papeleta p
            LEFT JOIN Lista l ON p.Numero_lista = l.Numero
            LEFT JOIN Partido pr ON l.Id_partido = pr.Id_partido
            WHERE p.Id_eleccion = ?
        `;

        const result = await executeQuery(query, [eleccionActiva.Id_eleccion]);
        return {
            ...eleccionActiva,
            ...result[0]
        };
    }
}

module.exports = Eleccion;
