const eleccionService = require("../services/eleccionService")

class EleccionController {
    async obtenerEleccionActiva(req, res) {
        try {
            const eleccion = await eleccionService.obtenerEleccionActiva()

            if (!eleccion) {
                return res.status(404).json({ error: "No hay elecciones activas" })
            }

            res.json({ success: true, eleccion })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async obtenerPapeletas(req, res) {
        try {
            const { idEleccion } = req.params
            const papeletas = await eleccionService.obtenerPapeletas(idEleccion)

            res.json({ success: true, papeletas })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async obtenerResultados(req, res) {
        try {
            const { idCircuito } = req.params
            const { cedulaSolicitante } = req.query

            if (!cedulaSolicitante) {
                return res.status(400).json({ error: "Cédula del solicitante es requerida" })
            }

            const { resultados, estadoMesa } = await eleccionService.obtenerResultadosCircuito(idCircuito, cedulaSolicitante)

            // Calcular totales y porcentajes
            const totalVotos = resultados.reduce((sum, r) => sum + r.CantidadVotos, 0)
            const resultadosConPorcentaje = resultados.map((r) => ({
                ...r,
                Porcentaje: totalVotos > 0 ? ((r.CantidadVotos / totalVotos) * 100).toFixed(2) : 0,
            }))

            res.json({
                success: true,
                resultados: resultadosConPorcentaje,
                totalVotos,
                estadoMesa,
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async obtenerResultadosDepartamento(req, res) {
        try {
            const { idDepartamento } = req.params
            const resultados = await eleccionService.obtenerResultadosDepartamento(idDepartamento)

            const totalVotos = resultados.reduce((sum, r) => sum + r.CantidadVotos, 0)
            const resultadosConPorcentaje = resultados.map((r) => ({
                ...r,
                Porcentaje: totalVotos > 0 ? ((r.CantidadVotos / totalVotos) * 100).toFixed(2) : 0,
            }))

            res.json({
                success: true,
                resultados: resultadosConPorcentaje,
                totalVotos,
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    async obtenerResultadosNacionales(req, res) {
        try {
            const resultados = await eleccionService.obtenerResultadosNacionales()

            const totalVotos = resultados.reduce((sum, r) => sum + r.CantidadVotos, 0)
            const resultadosConPorcentaje = resultados.map((r) => ({
                ...r,
                Porcentaje: totalVotos > 0 ? ((r.CantidadVotos / totalVotos) * 100).toFixed(2) : 0,
            }))

            res.json({
                success: true,
                resultados: resultadosConPorcentaje,
                totalVotos,
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = new EleccionController()