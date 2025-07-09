const request = require('supertest');
const app = require('../app');

// Mock manual para este test específico
jest.mock('../../services/eleccionService', () => ({
    obtenerEleccionActiva: jest.fn(),
    obtenerPapeletas: jest.fn(),
    obtenerResultadosCircuito: jest.fn(),
    obtenerResultadosDepartamento: jest.fn(),
    obtenerResultadosNacionales: jest.fn()
}));

const eleccionService = require('../../services/eleccionService');

describe('Elección Endpoints', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/elecciones/activa', () => {
        it('debería obtener la elección activa', async () => {
            const mockEleccion = {
                Id_eleccion: 1,
                Titulo: 'Elección Test',
                Fecha_inicio: '2023-01-01',
                Fecha_fin: '2023-12-31'
            };

            eleccionService.obtenerEleccionActiva.mockResolvedValue(mockEleccion);

            const response = await request(app)
                .get('/api/elecciones/activa');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.eleccion).toBeDefined();
            expect(response.body.eleccion.Id_eleccion).toBe(1);
            expect(response.body.eleccion.Titulo).toBe('Elección Test');
            expect(response.body.eleccion.Fecha_inicio).toBe('2023-01-01');
            expect(response.body.eleccion.Fecha_fin).toBe('2023-12-31');
        });

        it('debería retornar 404 si no hay elecciones activas', async () => {
            eleccionService.obtenerEleccionActiva.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/elecciones/activa');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('No hay elecciones activas');
        });
    });

    describe('GET /api/elecciones/:idEleccion/papeletas', () => {
        it('debería obtener papeletas de una elección específica', async () => {
            const mockPapeletas = [
                { Id_papeleta: 1, Nombre_lista: 'Lista A', Numero_lista: 1 },
                { Id_papeleta: 2, Nombre_lista: 'Lista B', Numero_lista: 2 }
            ];

            eleccionService.obtenerPapeletas.mockResolvedValue(mockPapeletas);

            const idEleccion = 1;
            
            const response = await request(app)
                .get(`/api/elecciones/${idEleccion}/papeletas`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.papeletas).toBeDefined();
            expect(Array.isArray(response.body.papeletas)).toBe(true);
            expect(response.body.papeletas.length).toBe(2);
            expect(response.body.papeletas[0].Id_papeleta).toBe(1);
            expect(response.body.papeletas[0].Nombre_lista).toBe('Lista A');
            expect(response.body.papeletas[0].Numero_lista).toBe(1);
        });

        it('debería manejar elección inexistente', async () => {
            eleccionService.obtenerPapeletas.mockResolvedValue([]);

            const idEleccion = 99999;
            
            const response = await request(app)
                .get(`/api/elecciones/${idEleccion}/papeletas`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.papeletas).toBeDefined();
            expect(Array.isArray(response.body.papeletas)).toBe(true);
            expect(response.body.papeletas.length).toBe(0);
        });
    });

    describe('GET /api/elecciones/resultados/nacionales', () => {
        it('debería obtener resultados nacionales', async () => {
            const mockResultados = [
                { Nombre_lista: 'Lista A', CantidadVotos: 1000 },
                { Nombre_lista: 'Lista B', CantidadVotos: 500 }
            ];

            eleccionService.obtenerResultadosNacionales.mockResolvedValue(mockResultados);

            const response = await request(app)
                .get('/api/elecciones/resultados/nacionales');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.resultados).toBeDefined();
            expect(Array.isArray(response.body.resultados)).toBe(true);
            expect(response.body.totalVotos).toBe(1500);
            expect(response.body.resultados[0].Nombre_lista).toBe('Lista A');
            expect(response.body.resultados[0].CantidadVotos).toBe(1000);
            expect(response.body.resultados[0].Porcentaje).toBe('66.67');
        });
    });

    describe('GET /api/elecciones/resultados/departamento/:idDepartamento', () => {
        it('debería obtener resultados por departamento', async () => {
            const mockResultados = [
                { Nombre_lista: 'Lista A', CantidadVotos: 200 },
                { Nombre_lista: 'Lista B', CantidadVotos: 100 }
            ];

            eleccionService.obtenerResultadosDepartamento.mockResolvedValue(mockResultados);

            const idDepartamento = 1;
            
            const response = await request(app)
                .get(`/api/elecciones/resultados/departamento/${idDepartamento}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.resultados).toBeDefined();
            expect(Array.isArray(response.body.resultados)).toBe(true);
            expect(response.body.totalVotos).toBe(300);
            expect(response.body.resultados[0].Nombre_lista).toBe('Lista A');
            expect(response.body.resultados[0].CantidadVotos).toBe(200);
            expect(response.body.resultados[0].Porcentaje).toBe('66.67');
        });

        it('debería manejar departamento inexistente', async () => {
            eleccionService.obtenerResultadosDepartamento.mockResolvedValue([]);

            const idDepartamento = 99999;
            
            const response = await request(app)
                .get(`/api/elecciones/resultados/departamento/${idDepartamento}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.resultados).toBeDefined();
            expect(Array.isArray(response.body.resultados)).toBe(true);
            expect(response.body.resultados.length).toBe(0);
        });
    });

    describe('GET /api/elecciones/resultados/:idCircuito', () => {
        it('debería obtener resultados por circuito con cédula válida', async () => {
            const mockResultados = [
                { Nombre_lista: 'Lista A', CantidadVotos: 100 },
                { Nombre_lista: 'Lista B', CantidadVotos: 50 }
            ];
            const mockEstadoMesa = { Estado: 'Abierta' };

            eleccionService.obtenerResultadosCircuito.mockResolvedValue({
                resultados: mockResultados,
                estadoMesa: mockEstadoMesa
            });

            const idCircuito = 1;
            const cedulaSolicitante = '12345678';
            
            const response = await request(app)
                .get(`/api/elecciones/resultados/${idCircuito}`)
                .query({ cedulaSolicitante });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.resultados).toBeDefined();
            expect(Array.isArray(response.body.resultados)).toBe(true);
            expect(response.body.totalVotos).toBe(150);
            expect(response.body.estadoMesa).toBeDefined();
            expect(response.body.resultados[0].Nombre_lista).toBe('Lista A');
            expect(response.body.resultados[0].CantidadVotos).toBe(100);
            expect(response.body.resultados[0].Porcentaje).toBe('66.67');
        });

        it('debería fallar sin cédula de solicitante', async () => {
            const idCircuito = 1;
            
            const response = await request(app)
                .get(`/api/elecciones/resultados/${idCircuito}`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Cédula del solicitante es requerida');
        });

        it('debería manejar circuito inexistente', async () => {
            eleccionService.obtenerResultadosCircuito.mockResolvedValue({
                resultados: [],
                estadoMesa: null
            });

            const idCircuito = 99999;
            const cedulaSolicitante = '12345678';
            
            const response = await request(app)
                .get(`/api/elecciones/resultados/${idCircuito}`)
                .query({ cedulaSolicitante });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.resultados).toBeDefined();
            expect(Array.isArray(response.body.resultados)).toBe(true);
            expect(response.body.resultados.length).toBe(0);
        });
    });
});
