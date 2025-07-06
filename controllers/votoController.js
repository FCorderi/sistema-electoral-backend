const Voto = require('../models/Voto');
const Votante = require('../models/Votante');
const Candidato = require('../models/Candidato');

class VotoController {
    // Registrar voto
    static async votar(req, res) {
        try {
            const { cedula, candidatoId } = req.body;

            if (!cedula || !candidatoId) {
                return res.status(400).json({
                    success: false,
                    error: 'Cédula y candidato son requeridos'
                });
            }

            // Verificar que el votante existe y está activo
            const votante = await Votante.findByCedula(cedula);
            if (!votante) {
                return res.status(404).json({
                    success: false,
                    error: 'Votante no encontrado'
                });
            }

            // Verificar que no haya votado ya
            const yaVoto = await Votante.hasVoted(cedula);
            if (yaVoto) {
                return res.status(400).json({
                    success: false,
                    error: 'El votante ya emitió su voto'
                });
            }

            // Verificar que el candidato existe y está activo
            const candidato = await Candidato.findById(candidatoId);
            if (!candidato) {
                return res.status(400).json({
                    success: false,
                    error: 'Candidato inválido'
                });
            }

            // Registrar el voto
            await Voto.create(cedula, candidatoId);

            res.json({
                success: true,
                message: `Voto registrado para ${candidato.Nombre}`
            });

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    error: 'El votante ya emitió su voto'
                });
            }

            console.error('Error registrando voto:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener resultados
    static async getResultados(req, res) {
        try {
            const resultados = await Voto.getResultados();

            // Calcular total de votos y porcentajes
            const totalVotos = resultados.reduce((sum, r) => sum + r.votos, 0);

            const resultadosConPorcentaje = resultados.map(resultado => ({
                ...resultado,
                porcentaje: totalVotos > 0 ? ((resultado.votos / totalVotos) * 100).toFixed(1) : '0.0'
            }));

            res.json({
                success: true,
                resultados: resultadosConPorcentaje,
                totalVotos
            });

        } catch (error) {
            console.error('Error obteniendo resultados:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Obtener estadísticas
    static async getEstadisticas(req, res) {
        try {
            const estadisticas = await Voto.getEstadisticas();

            res.json({
                success: true,
                estadisticas
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}

module.exports = VotoController;