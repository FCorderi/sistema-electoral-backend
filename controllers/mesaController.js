const mesaService = require("../services/mesaService")

class MesaController {
    async obtenerEstadoMesa(req, res) {
        try {
            const { idCircuito } = req.params
            const estado = await mesaService.obtenerEstadoMesa(idCircuito)

            if (!estado) {
                return res.status(404).json({ error: "Mesa no encontrada" })
            }

            res.json({ success: true, estado })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async cerrarMesa(req, res) {
        try {
            const { idCircuito } = req.params
            const { cedulaPresidente } = req.body

            if (!cedulaPresidente) {
                return res.status(400).json({ error: "Cédula del presidente es requerida" })
            }

            await mesaService.cerrarMesa(idCircuito, cedulaPresidente)

            res.json({
                success: true,
                message: "Mesa cerrada exitosamente",
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async obtenerMesasAbiertas(req, res) {
        try {
            const mesas = await mesaService.obtenerMesasAbiertas()
            res.json({ success: true, mesas })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = new MesaController()