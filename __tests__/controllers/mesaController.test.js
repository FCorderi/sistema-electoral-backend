const mesaController = require('../../controllers/mesaController');
const mesaService = require('../../services/mesaService');

// Mock del servicio
jest.mock('../../services/mesaService');

describe('MesaController', () => {
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

    describe('obtenerEstadoMesa', () => {
        it('debería obtener estado de mesa exitosamente', async () => {
            const mockEstado = {
                Id_circuito: 1,
                Estado: 'Abierta',
                Departamento: 'Montevideo',
                Ciudad: 'Montevideo',
                Barrio: 'Centro'
            };

            req.params = { idCircuito: '1' };
            mesaService.obtenerEstadoMesa.mockResolvedValue(mockEstado);

            await mesaController.obtenerEstadoMesa(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                estado: mockEstado
            });
        });

        it('debería retornar 404 si mesa no encontrada', async () => {
            req.params = { idCircuito: '999' };
            mesaService.obtenerEstadoMesa.mockResolvedValue(null);

            await mesaController.obtenerEstadoMesa(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Mesa no encontrada'
            });
        });

        it('debería manejar errores del servicio', async () => {
            req.params = { idCircuito: '1' };
            mesaService.obtenerEstadoMesa.mockRejectedValue(new Error('Database error'));

            await mesaController.obtenerEstadoMesa(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });

    describe('cerrarMesa', () => {
        it('debería cerrar mesa exitosamente', async () => {
            req.params = { idCircuito: '1' };
            req.body = { cedulaPresidente: '12345678' };
            
            mesaService.cerrarMesa.mockResolvedValue();

            await mesaController.cerrarMesa(req, res);

            expect(mesaService.cerrarMesa).toHaveBeenCalledWith('1', '12345678');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Mesa cerrada exitosamente'
            });
        });

        it('debería fallar sin cédula de presidente', async () => {
            req.params = { idCircuito: '1' };
            req.body = {};

            await mesaController.cerrarMesa(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cédula del presidente es requerida'
            });
        });

        it('debería fallar con cédula de presidente vacía', async () => {
            req.params = { idCircuito: '1' };
            req.body = { cedulaPresidente: '' };

            await mesaController.cerrarMesa(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cédula del presidente es requerida'
            });
        });

        it('debería manejar errores del servicio', async () => {
            req.params = { idCircuito: '1' };
            req.body = { cedulaPresidente: '12345678' };
            
            mesaService.cerrarMesa.mockRejectedValue(new Error('Service error'));

            await mesaController.cerrarMesa(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Service error'
            });
        });
    });

    describe('obtenerMesasAbiertas', () => {
        it('debería obtener mesas abiertas exitosamente', async () => {
            const mockMesas = [
                {
                    Id_circuito: 1,
                    Estado: 'Abierta',
                    Departamento: 'Montevideo',
                    Ciudad: 'Montevideo',
                    Barrio: 'Centro'
                },
                {
                    Id_circuito: 2,
                    Estado: 'Abierta',
                    Departamento: 'Canelones',
                    Ciudad: 'Canelones',
                    Barrio: 'Centro'
                }
            ];

            mesaService.obtenerMesasAbiertas.mockResolvedValue(mockMesas);

            await mesaController.obtenerMesasAbiertas(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                mesas: mockMesas
            });
        });

        it('debería retornar array vacío si no hay mesas abiertas', async () => {
            mesaService.obtenerMesasAbiertas.mockResolvedValue([]);

            await mesaController.obtenerMesasAbiertas(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                mesas: []
            });
        });

        it('debería manejar errores del servicio', async () => {
            mesaService.obtenerMesasAbiertas.mockRejectedValue(new Error('Database error'));

            await mesaController.obtenerMesasAbiertas(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });
});
