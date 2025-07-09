const eleccionController = require('../../controllers/eleccionController');
const eleccionService = require('../../services/eleccionService');

// Mock del servicio
jest.mock('../../services/eleccionService');

describe('EleccionController', () => {
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

    describe('obtenerEleccionActiva', () => {
        it('debería obtener elección activa exitosamente', async () => {
            const mockEleccion = {
                Id_eleccion: 1,
                Titulo: 'Elección Test',
                Fecha_inicio: '2023-01-01',
                Fecha_fin: '2023-12-31'
            };

            eleccionService.obtenerEleccionActiva.mockResolvedValue(mockEleccion);

            await eleccionController.obtenerEleccionActiva(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                eleccion: mockEleccion
            });
        });

        it('debería retornar 404 si no hay elecciones activas', async () => {
            eleccionService.obtenerEleccionActiva.mockResolvedValue(null);

            await eleccionController.obtenerEleccionActiva(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No hay elecciones activas'
            });
        });

        it('debería manejar errores del servicio', async () => {
            eleccionService.obtenerEleccionActiva.mockRejectedValue(new Error('Database error'));

            await eleccionController.obtenerEleccionActiva(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database error'
            });
        });
    });

    describe('obtenerPapeletas', () => {
        it('debería obtener papeletas exitosamente', async () => {
            const mockPapeletas = [
                { Id_papeleta: 1, Nombre_lista: 'Lista A', Numero_lista: 1 },
                { Id_papeleta: 2, Nombre_lista: 'Lista B', Numero_lista: 2 }
            ];

            req.params = { idEleccion: '1' };
            eleccionService.obtenerPapeletas.mockResolvedValue(mockPapeletas);

            await eleccionController.obtenerPapeletas(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                papeletas: mockPapeletas
            });
        });

        it('debería manejar errores del servicio', async () => {
            req.params = { idEleccion: '1' };
            eleccionService.obtenerPapeletas.mockRejectedValue(new Error('Service error'));

            await eleccionController.obtenerPapeletas(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Service error'
            });
        });
    });

    describe('obtenerResultados', () => {
        it('debería obtener resultados exitosamente', async () => {
            const mockResultados = [
                { Nombre_lista: 'Lista A', CantidadVotos: 100 },
                { Nombre_lista: 'Lista B', CantidadVotos: 50 }
            ];
            const mockEstadoMesa = { Estado: 'Abierta' };

            req.params = { idCircuito: '1' };
            req.query = { cedulaSolicitante: '12345678' };
            
            eleccionService.obtenerResultadosCircuito.mockResolvedValue({
                resultados: mockResultados,
                estadoMesa: mockEstadoMesa
            });

            await eleccionController.obtenerResultados(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                resultados: [
                    { Nombre_lista: 'Lista A', CantidadVotos: 100, Porcentaje: '66.67' },
                    { Nombre_lista: 'Lista B', CantidadVotos: 50, Porcentaje: '33.33' }
                ],
                totalVotos: 150,
                estadoMesa: mockEstadoMesa
            });
        });

        it('debería fallar sin cédula de solicitante', async () => {
            req.params = { idCircuito: '1' };
            req.query = {};

            await eleccionController.obtenerResultados(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cédula del solicitante es requerida'
            });
        });

        it('debería calcular porcentajes correctamente con cero votos', async () => {
            const mockResultados = [
                { Nombre_lista: 'Lista A', CantidadVotos: 0 },
                { Nombre_lista: 'Lista B', CantidadVotos: 0 }
            ];
            const mockEstadoMesa = { Estado: 'Abierta' };

            req.params = { idCircuito: '1' };
            req.query = { cedulaSolicitante: '12345678' };
            
            eleccionService.obtenerResultadosCircuito.mockResolvedValue({
                resultados: mockResultados,
                estadoMesa: mockEstadoMesa
            });

            await eleccionController.obtenerResultados(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                resultados: [
                    { Nombre_lista: 'Lista A', CantidadVotos: 0, Porcentaje: 0 },
                    { Nombre_lista: 'Lista B', CantidadVotos: 0, Porcentaje: 0 }
                ],
                totalVotos: 0,
                estadoMesa: mockEstadoMesa
            });
        });
    });

    describe('obtenerResultadosDepartamento', () => {
        it('debería obtener resultados por departamento exitosamente', async () => {
            const mockResultados = [
                { Nombre_lista: 'Lista A', CantidadVotos: 200 },
                { Nombre_lista: 'Lista B', CantidadVotos: 100 }
            ];

            req.params = { idDepartamento: '1' };
            eleccionService.obtenerResultadosDepartamento.mockResolvedValue(mockResultados);

            await eleccionController.obtenerResultadosDepartamento(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                resultados: [
                    { Nombre_lista: 'Lista A', CantidadVotos: 200, Porcentaje: '66.67' },
                    { Nombre_lista: 'Lista B', CantidadVotos: 100, Porcentaje: '33.33' }
                ],
                totalVotos: 300
            });
        });

        it('debería manejar errores del servicio', async () => {
            req.params = { idDepartamento: '1' };
            eleccionService.obtenerResultadosDepartamento.mockRejectedValue(new Error('Service error'));

            await eleccionController.obtenerResultadosDepartamento(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Service error'
            });
        });
    });

    describe('obtenerResultadosNacionales', () => {
        it('debería obtener resultados nacionales exitosamente', async () => {
            const mockResultados = [
                { Nombre_lista: 'Lista A', CantidadVotos: 1000 },
                { Nombre_lista: 'Lista B', CantidadVotos: 500 }
            ];

            eleccionService.obtenerResultadosNacionales.mockResolvedValue(mockResultados);

            await eleccionController.obtenerResultadosNacionales(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                resultados: [
                    { Nombre_lista: 'Lista A', CantidadVotos: 1000, Porcentaje: '66.67' },
                    { Nombre_lista: 'Lista B', CantidadVotos: 500, Porcentaje: '33.33' }
                ],
                totalVotos: 1500
            });
        });

        it('debería manejar errores del servicio', async () => {
            eleccionService.obtenerResultadosNacionales.mockRejectedValue(new Error('Service error'));

            await eleccionController.obtenerResultadosNacionales(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Service error'
            });
        });
    });
});
