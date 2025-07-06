const { pool, executeQuery } = require("../config/database")
const { VOTE_STATES } = require("../utils/constants")
const mesaService = require("./mesaService")

class VotanteService {
    async obtenerVotantePorCedula(cedula) {
        try {
            const query = `
        SELECT v.*, c.Id_circuito, c.Es_accesible, 
               z.Ciudad, z.Paraje, z.Barrio, 
               d.Nombre as Departamento
        FROM Votante v
        JOIN Circuito c ON v.Id_circuito = c.Id_circuito
        JOIN Zona z ON c.Id_zona = z.Id_zona
        JOIN Departamento d ON z.Id_departamento = d.Id_departamento
        WHERE v.Cedula = ?
      `;

            const rows = await executeQuery(query, [cedula]);
            return rows[0];
        } catch (error) {
            throw new Error("Error al obtener votante: " + error.message)
        }
    }

    async obtenerRolUsuario(cedula) {
        try {
            // Verificar si es miembro de mesa
            const query = `
        SELECT Rol, Id_circuito_que_compone as circuito 
        FROM Miembro_de_mesa 
        WHERE Cedula = ?
      `;

            const mesaRows = await executeQuery(query, [cedula]);

            if (mesaRows.length > 0) {
                return {
                    tipo: "miembro_mesa",
                    rol: mesaRows[0].Rol,
                    circuito: mesaRows[0].circuito,
                }
            }

            // Si no es miembro de mesa, es votante regular
            return {
                tipo: "votante",
                rol: "Votante",
                circuito: null,
            }
        } catch (error) {
            throw new Error("Error al obtener rol de usuario: " + error.message)
        }
    }

    async verificarYaVoto(cedula, idEleccion) {
        try {
            const query = `
        SELECT COUNT(*) as count 
        FROM Votante_voto vv
        JOIN Voto v ON vv.Id_voto = v.Id_voto
        JOIN Papeleta p ON v.Id_papeleta = p.Id_papeleta
        WHERE vv.Cedula = ? AND p.Id_eleccion = ?
      `;

            const rows = await executeQuery(query, [cedula, idEleccion]);
            return rows[0].count > 0;
        } catch (error) {
            throw new Error("Error al verificar voto: " + error.message)
        }
    }

    async registrarVoto(cedula, idPapeleta, idCircuito, observado = false) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // Verificar que la mesa está abierta
            const estadoMesa = await mesaService.obtenerEstadoMesa(idCircuito)
            if (!estadoMesa || !estadoMesa.Esta_abierta) {
                throw new Error("La mesa de votación está cerrada. No se pueden registrar más votos.")
            }

            // Crear el voto
            const [votoResult] = await connection.execute(
                `INSERT INTO Voto (Id_papeleta, Id_circuito, Fecha_hora_voto, Es_observado) 
         VALUES (?, ?, NOW(), ?)`,
                [idPapeleta, idCircuito, observado],
            )

            const idVoto = votoResult.insertId

            // Asociar votante con voto
            await connection.execute(
                `INSERT INTO Votante_voto (Cedula, Id_voto) 
         VALUES (?, ?)`,
                [cedula, idVoto],
            )

            await connection.commit()
            return idVoto
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }
}

module.exports = new VotanteService()