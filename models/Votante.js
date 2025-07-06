const { executeQuery } = require('../config/database');

class Votante {
    // Buscar votante por cédula
    static async findByCedula(cedula) {
        const query = `
            SELECT 
                v.Cedula, 
                v.Nombre_completo, 
                v.Fecha_nacimiento,
                v.Credencial,
                v.Id_circuito,
                c.Es_accesible,
                z.Ciudad,
                z.Barrio,
                d.Nombre as Departamento
            FROM Votante v
            JOIN Circuito c ON v.Id_circuito = c.Id_circuito
            JOIN Zona z ON c.Id_zona = z.Id_zona
            JOIN Departamento d ON z.Id_departamento = d.Id_departamento
            WHERE v.Cedula = ?
        `;

        const result = await executeQuery(query, [cedula]);
        return result.length > 0 ? result[0] : null;
    }

    // Verificar si ya votó (usando la tabla Votante_voto)
    static async hasVoted(cedula) {
        const query = 'SELECT COUNT(*) as count FROM Votante_voto WHERE Cedula = ?';
        const result = await executeQuery(query, [cedula]);
        return result[0].count > 0;
    }

    // Obtener todos los votantes
    static async getAll() {
        const query = `
            SELECT 
                v.Cedula,
                v.Nombre_completo,
                v.Fecha_nacimiento,
                v.Credencial,
                c.Id_circuito,
                z.Ciudad,
                z.Barrio,
                d.Nombre as Departamento
            FROM Votante v
            JOIN Circuito c ON v.Id_circuito = c.Id_circuito
            JOIN Zona z ON c.Id_zona = z.Id_zona
            JOIN Departamento d ON z.Id_departamento = d.Id_departamento
            ORDER BY v.Nombre_completo
        `;
        return await executeQuery(query);
    }

    // Crear nuevo votante
    static async create(cedula, nombreCompleto, fechaNacimiento, credencial, idCircuito) {
        const query = `
            INSERT INTO Votante (Cedula, Nombre_completo, Fecha_nacimiento, Credencial, Id_circuito) 
            VALUES (?, ?, ?, ?, ?)
        `;
        return await executeQuery(query, [cedula, nombreCompleto, fechaNacimiento, credencial, idCircuito]);
    }

    // Verificar si es miembro de mesa
    static async isMiembroMesa(cedula) {
        const query = `
            SELECT mm.*, c.Id_circuito
            FROM Miembro_de_mesa mm
            JOIN Circuito c ON mm.Id_circuito_que_compone = c.Id_circuito
            WHERE mm.Cedula = ?
        `;
        const result = await executeQuery(query, [cedula]);
        return result.length > 0 ? result[0] : null;
    }

    // Obtener votantes por circuito
    static async getByCircuito(idCircuito) {
        const query = `
            SELECT 
                Cedula,
                Nombre_completo,
                Credencial
            FROM Votante
            WHERE Id_circuito = ?
            ORDER BY Nombre_completo
        `;
        return await executeQuery(query, [idCircuito]);
    }
}

module.exports = Votante;