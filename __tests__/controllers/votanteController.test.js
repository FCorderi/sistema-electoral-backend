const votanteController = require('../../controllers/votanteController');
const votanteService = require('../../services/votanteService');
const eleccionService = require('../../services/eleccionService');

// Mock de los servicios
jest.mock('../../services/votanteService');
jest.mock('../../services/eleccionService');

describe('VotanteController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('debería hacer login exitoso', async () => {
            const mockVotante = {
                Cedula: '12345678',
                Nombre_completo: 'Test User',
                Credencial: 'TEST001',
                Id_circuito: 1,
                Departamento: 'Montevideo',
                Ciudad: 'Montevideo',
                Barrio: 'Centro'
            };

            const mockRol = 'Votante';

            req.body = { credencial: 'TEST001' };
            
            votanteService.obtenerVotantePorCredencial.mockResolvedValue(mockVotante);
            votanteService.obtenerRolUsuario.mockResolvedValue(mockRol);

            await votanteController.login(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                votante: {
                    cedula: '12345678',
                    nombre: 'Test User',
                    credencial: 'TEST001',
                    circuito: 1,
                    ubicacion: {
                        departamento: 'Montevideo',
                        ciudad: 'Montevideo',
                        barrio: 'Centro'
                    },
                    rol: 'Votante'
                }
            });
        });

        it('debería fallar login sin credencial', async () => {
            req.body = {};

            await votanteController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Credencial es requerida'
            });
        });

        it('debería fallar login con credencial vacía', async () => {
            req.body = { credencial: '' };

            await votanteController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Credencial es requerida'
            });
        });

        it('debería fallar login con votante no encontrado', async () => {
            req.body = { credencial: 'INVALID' };
            
            votanteService.obtenerVotantePorCredencial.mockResolvedValue(null);

            await votanteController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Votante no encontrado'
            });
        });

        it('debería manejar errores del servicio', async () => {
            req.body = { credencial: 'TEST001' };
            
            votanteService.obtenerVotantePorCredencial.mockRejectedValue(new Error('Database error'));

            await votanteController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });

    describe('votar', () => {
        const mockEleccionActiva = { Id_eleccion: 1 };
        const mockVotante = { Id_circuito: 1 };

        beforeEach(() => {
            eleccionService.obtenerEleccionActiva.mockResolvedValue(mockEleccionActiva);
            votanteService.obtenerVotantePorCredencial.mockResolvedValue(mockVotante);
        });

        it('debería registrar voto exitosamente', async () => {
            req.body = {
                credencial: 'TEST001',
                idPapeleta: 1,
                idCircuito: 1
            };

            votanteService.verificarYaVotoPorCredencial.mockResolvedValue(false);
            votanteService.registrarVotoPorCredencial.mockResolvedValue(123);

            await votanteController.votar(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Voto registrado exitosamente',
                idVoto: 123,
                observado: false
            });
        });

        it('debería registrar voto como observado', async () => {
            req.body = {
                credencial: 'TEST001',
                idPapeleta: 1,
                idCircuito: 2 // Diferente al circuito del votante
            };

            votanteService.verificarYaVotoPorCredencial.mockResolvedValue(false);
            votanteService.registrarVotoPorCredencial.mockResolvedValue(124);

            await votanteController.votar(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Voto registrado como observado (no corresponde a su circuito)',
                idVoto: 124,
                observado: true
            });
        });

        it('debería fallar si ya votó', async () => {
            req.body = {
                credencial: 'TEST001',
                idPapeleta: 1,
                idCircuito: 1
            };

            votanteService.verificarYaVotoPorCredencial.mockResolvedValue(true);

            await votanteController.votar(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Ya ha emitido su voto en esta elección'
            });
        });

        it('debería manejar errores del servicio', async () => {
            req.body = {
                credencial: 'TEST001',
                idPapeleta: 1,
                idCircuito: 1
            };

            votanteService.verificarYaVotoPorCredencial.mockRejectedValue(new Error('Service error'));

            await votanteController.votar(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Service error'
            });
        });
    });
});
