const { pool, executeQuery } = require("../config/database")

class MesaService {
    async obtenerEstadoMesa(idCircuito) {
        try {
            const query = `
        SELECT em.*, c.Id_circuito, z.Ciudad, z.Barrio, d.Nombre as Departamento
        FROM Estado_mesa em
        JOIN Circuito c ON em.Id_circuito = c.Id_circuito
        JOIN Zona z ON c.Id_zona = z.Id_zona
        JOIN Departamento d ON z.Id_departamento = d.Id_departamento
        WHERE em.Id_circuito = ?
      `;

            const rows = await executeQuery(query, [idCircuito]);
            return rows[0];
        } catch (error) {
            throw new Error("Error al obtener estado de mesa: " + error.message)
        }
    }

    async verificarPresidenteMesa(cedula, idCircuito) {
        try {
            const query = `
        SELECT * FROM Miembro_de_mesa 
        WHERE Cedula = ? AND Id_circuito_que_compone = ? AND Rol = 'Presidente'
      `;

            const rows = await executeQuery(query, [cedula, idCircuito]);
            return rows.length > 0;
        } catch (error) {
            throw new Error("Error al verificar presidente de mesa: " + error.message)
        }
    }

    async cerrarMesa(idCircuito, cedulaPresidente) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // Verificar que el usuario es presidente de esa mesa
            const esPresidente = await this.verificarPresidenteMesa(cedulaPresidente, idCircuito)
            if (!esPresidente) {
                throw new Error("Solo el presidente de mesa puede cerrar la votación")
            }

            // Verificar que la mesa está abierta
            const estadoMesa = await this.obtenerEstadoMesa(idCircuito)
            if (!estadoMesa.Esta_abierta) {
                throw new Error("La mesa ya está cerrada")
            }

            // Cerrar la mesa
            await connection.execute(
                `UPDATE Estado_mesa 
         SET Esta_abierta = FALSE, Fecha_cierre = NOW(), Cedula_presidente_cierre = ?
         WHERE Id_circuito = ?`,
                [cedulaPresidente, idCircuito],
            )

            await connection.commit()
            return true
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    async obtenerMesasAbiertas() {
        try {
            const query = `
        SELECT em.Id_circuito, em.Esta_abierta, em.Fecha_apertura,
               z.Ciudad, z.Barrio, d.Nombre as Departamento,
               COUNT(v.Id_voto) as VotosEmitidos
        FROM Estado_mesa em
        JOIN Circuito c ON em.Id_circuito = c.Id_circuito
        JOIN Zona z ON c.Id_zona = z.Id_zona
        JOIN Departamento d ON z.Id_departamento = d.Id_departamento
        LEFT JOIN Voto v ON c.Id_circuito = v.Id_circuito
        WHERE em.Esta_abierta = TRUE
        GROUP BY em.Id_circuito
      `;

            const rows = await executeQuery(query);
            return rows;
        } catch (error) {
            throw new Error("Error al obtener mesas abiertas: " + error.message)
        }
    }
}

module.exports = new MesaService()