const Candidato = require('../models/Candidato');

class CandidatoController {
    // Obtener todos los candidatos
    static async getAll(req, res) {
        try {
            const candidatos = await Candidato.getAll();
            res.json({
                success: true,
                candidatos
            });
        } catch (error) {
            console.error('Error obteniendo candidatos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener candidato por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const candidato = await Candidato.findById(id);

            if (!candidato) {
                return res.status(404).json({
                    success: false,
                    error: 'Candidato no encontrado'
                });
            }

            res.json({
                success: true,
                candidato
            });
        } catch (error) {
            console.error('Error obteniendo candidato:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}

module.exports = CandidatoController;