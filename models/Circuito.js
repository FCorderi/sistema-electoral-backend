const { executeQuery } = require('../config/database');

class Circuito {
    // Obtener todos los circuitos
    static async getAll() {
        const query = `
            SELECT 
                c.Id_circuito,
                c.Es_accesible,
                c.Numero_inicial_cc_autorizada,
                c.Numero_final_cc_autorizada,
                z.Ciudad,
                z.Paraje,
                z.Barrio,
                d.Nombre as Departamento
            FROM Circuito c
            JOIN Zona z ON c.Id_zona = z.Id_zona
            JOIN Departamento d ON z.Id_departamento = d.Id_departamento
            ORDER BY d.Nombre, z.Ciudad, c.Id_circuito
        `;
        return await executeQuery(query);
    }

    // Buscar circuito por ID
    static async findById(id) {
        const query = `
            SELECT 
                c.Id_circuito,
                c.Es_accesible,
                c.Numero_inicial_cc_autorizada,
                c.Numero_final_cc_autorizada,
                z.Ciudad,
                z.Paraje,
                z.Barrio,
                d.Nombre as Departamento
            FROM Circuito c
            JOIN Zona z ON c.Id_zona = z.Id_zona
            JOIN Departamento d ON z.Id_departamento = d.Id_departamento
            WHERE c.Id_circuito = ?
        `;
        const result = await executeQuery(query, [id]);
        return result.length > 0 ? result[0] : null;
    }

    // Obtener estado de mesa por circuito
    static async getEstadoMesa(idCircuito) {
        const query = `
            SELECT 
                em.Id_circuito,
                em.Esta_abierta,
                em.Fecha_apertura,
                em.Fecha_cierre,
                em.Cedula_presidente_cierre,
                v.Nombre_completo as Presidente_cierre
            FROM Estado_mesa em
            LEFT JOIN Miembro_de_mesa mm ON em.Cedula_presidente_cierre = mm.Cedula
            LEFT JOIN Votante v ON mm.Cedula = v.Cedula
            WHERE em.Id_circuito = ?
        `;
        const result = await executeQuery(query, [idCircuito]);
        return result.length > 0 ? result[0] : null;
    }

    // Abrir mesa
    static async abrirMesa(idCircuito) {
        const query = `
            INSERT INTO Estado_mesa (Id_circuito, Esta_abierta, Fecha_apertura) 
            VALUES (?, TRUE, NOW())
            ON DUPLICATE KEY UPDATE 
            Esta_abierta = TRUE, 
            Fecha_apertura = NOW(),
            Fecha_cierre = NULL,
            Cedula_presidente_cierre = NULL
        `;
        return await executeQuery(query, [idCircuito]);
    }

    // Cerrar mesa
    static async cerrarMesa(idCircuito, cedulaPresidente) {
        const query = `
            UPDATE Estado_mesa 
            SET Esta_abierta = FALSE, 
                Fecha_cierre = NOW(),
                Cedula_presidente_cierre = ?
            WHERE Id_circuito = ?
        `;
        return await executeQuery(query, [cedulaPresidente, idCircuito]);
    }

    // Obtener miembros de mesa por circuito
    static async getMiembrosMesa(idCircuito) {
        const query = `
            SELECT 
                mm.Cedula,
                v.Nombre_completo,
                mm.Organismo,
                mm.Rol
            FROM Miembro_de_mesa mm
            JOIN Votante v ON mm.Cedula = v.Cedula
            WHERE mm.Id_circuito_que_compone = ?
            ORDER BY 
                CASE mm.Rol 
                    WHEN 'Presidente' THEN 1 
                    WHEN 'Secretario' THEN 2 
                    ELSE 3 
                END, v.Nombre_completo
        `;
        return await executeQuery(query, [idCircuito]);
    }

    // Obtener circuitos por departamento
    static async getByDepartamento(idDepartamento) {
        const query = `
            SELECT 
                c.Id_circuito,
                c.Es_accesible,
                z.Ciudad,
                z.Barrio
            FROM Circuito c
            JOIN Zona z ON c.Id_zona = z.Id_zona
            WHERE z.Id_departamento = ?
            ORDER BY z.Ciudad, c.Id_circuito
        `;
        return await executeQuery(query, [idDepartamento]);
    }

    // Verificar si un votante puede votar en este circuito
    static async puedeVotar(cedula, idCircuito) {
        const query = `
            SELECT COUNT(*) as puede
            FROM Votante v
            WHERE v.Cedula = ? AND v.Id_circuito = ?
        `;
        const result = await executeQuery(query, [cedula, idCircuito]);
        return result[0].puede > 0;
    }
}

module.exports = Circuito;
