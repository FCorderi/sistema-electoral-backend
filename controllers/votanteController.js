const votanteService = require("../services/votanteService")
const eleccionService = require("../services/eleccionService")

class VotanteController {
    async login(req, res) {
        try {
            const { credencial } = req.body

            if (!credencial) {
                return res.status(400).json({ error: "Credencial es requerida" })
            }

            const votante = await votanteService.obtenerVotantePorCredencial(credencial)

            if (!votante) {
                return res.status(404).json({ error: "Votante no encontrado" })
            }

            // Obtener rol del usuario
            const rolUsuario = await votanteService.obtenerRolUsuario(credencial)

            res.json({
                success: true,
                votante: {
                    cedula: votante.Cedula,
                    nombre: votante.Nombre_completo,
                    credencial: votante.Credencial,
                    circuito: votante.Id_circuito,
                    ubicacion: {
                        departamento: votante.Departamento,
                        ciudad: votante.Ciudad,
                        barrio: votante.Barrio,
                    },
                    rol: rolUsuario,
                },
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async votar(req, res) {
        try {
            const { cedula, idPapeleta, idCircuito } = req.body

            // Verificar si ya votó
            const eleccionActiva = await eleccionService.obtenerEleccionActiva()
            const yaVoto = await votanteService.verificarYaVoto(cedula, eleccionActiva.Id_eleccion)

            if (yaVoto) {
                return res.status(400).json({ error: "Ya ha emitido su voto en esta elección" })
            }

            // Verificar si vota en su circuito correspondiente
            const votante = await votanteService.obtenerVotantePorCedula(cedula)
            const observado = votante.Id_circuito !== Number.parseInt(idCircuito)

            const idVoto = await votanteService.registrarVoto(cedula, idPapeleta, idCircuito, observado)

            res.json({
                success: true,
                message: observado
                    ? "Voto registrado como observado (no corresponde a su circuito)"
                    : "Voto registrado exitosamente",
                idVoto,
                observado,
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = new VotanteController()