const Votante = require('../models/Votante');

class VotanteController {
    // Login de votante
    static async login(req, res) {
        try {
            const { cedula } = req.body;

            if (!cedula) {
                return res.status(400).json({
                    success: false,
                    error: 'Cédula es requerida'
                });
            }

            // Buscar votante
            const votante = await Votante.findByCedula(cedula);

            if (!votante) {
                return res.status(404).json({
                    success: false,
                    error: 'Votante no encontrado'
                });
            }

            // Verificar si ya votó
            const yaVoto = await Votante.hasVoted(cedula);

            res.json({
                success: true,
                votante: {
                    cedula: votante.Cedula,
                    nombre: votante.Nombre_completo,
                    yaVoto: yaVoto
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener todos los votantes (admin)
    static async getAll(req, res) {
        try {
            const votantes = await Votante.getAll();
            res.json({
                success: true,
                votantes
            });
        } catch (error) {
            console.error('Error obteniendo votantes:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}

module.exports = VotanteController;