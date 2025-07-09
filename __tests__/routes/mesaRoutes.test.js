const request = require('supertest');
const app = require('../app');

// Mock manual para este test específico
jest.mock('../../services/mesaService', () => ({
    obtenerEstadoMesa: jest.fn(),
    cerrarMesa: jest.fn(),
    obtenerMesasAbiertas: jest.fn()
}));

const mesaService = require('../../services/mesaService');

describe('Mesa Endpoints', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/mesas/:idCircuito/estado', () => {
        it('debería obtener el estado de una mesa específica', async () => {
            const mockEstado = {
                Id_circuito: 1,
                Estado: 'Abierta',
                Departamento: 'Montevideo',
                Ciudad: 'Montevideo',
                Barrio: 'Centro'
            };

            mesaService.obtenerEstadoMesa.mockResolvedValue(mockEstado);

            const idCircuito = 1;
            
            const response = await request(app)
                .get(`/api/mesas/${idCircuito}/estado`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.estado).toBeDefined();
            expect(response.body.estado.Id_circuito).toBe(1);
            expect(response.body.estado.Estado).toBe('Abierta');
            expect(['Abierta', 'Cerrada'].includes(response.body.estado.Estado)).toBe(true);
        });

        it('debería retornar 404 para mesa inexistente', async () => {
            mesaService.obtenerEstadoMesa.mockResolvedValue(null);

            const idCircuito = 99999;
            
            const response = await request(app)
                .get(`/api/mesas/${idCircuito}/estado`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Mesa no encontrada');
        });

        it('debería manejar parámetros inválidos', async () => {
            mesaService.obtenerEstadoMesa.mockResolvedValue(null);

            const idCircuito = 'invalid';
            
            const response = await request(app)
                .get(`/api/mesas/${idCircuito}/estado`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Mesa no encontrada');
        });
    });

    describe('POST /api/mesas/:idCircuito/cerrar', () => {
        it('debería cerrar una mesa exitosamente', async () => {
            mesaService.cerrarMesa.mockResolvedValue();

            const idCircuito = 1;
            const cerrarData = {
                cedulaPresidente: '12345678'
            };
            
            const response = await request(app)
                .post(`/api/mesas/${idCircuito}/cerrar`)
                .send(cerrarData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Mesa cerrada exitosamente');
        });

        it('debería fallar al cerrar mesa sin cédula de presidente', async () => {
            const idCircuito = 1;
            
            const response = await request(app)
                .post(`/api/mesas/${idCircuito}/cerrar`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Cédula del presidente es requerida');
        });

        it('debería fallar al cerrar mesa con cédula vacía', async () => {
            const idCircuito = 1;
            const cerrarData = {
                cedulaPresidente: ''
            };
            
            const response = await request(app)
                .post(`/api/mesas/${idCircuito}/cerrar`)
                .send(cerrarData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Cédula del presidente es requerida');
        });

        it('debería manejar mesa inexistente', async () => {
            mesaService.cerrarMesa.mockRejectedValue(new Error('Mesa no encontrada'));

            const idCircuito = 99999;
            const cerrarData = {
                cedulaPresidente: '12345678'
            };
            
            const response = await request(app)
                .post(`/api/mesas/${idCircuito}/cerrar`)
                .send(cerrarData);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Mesa no encontrada');
        });

        it('debería manejar cédula de presidente inválida', async () => {
            mesaService.cerrarMesa.mockRejectedValue(new Error('Presidente no autorizado'));

            const idCircuito = 1;
            const cerrarData = {
                cedulaPresidente: 'INVALID_CEDULA'
            };
            
            const response = await request(app)
                .post(`/api/mesas/${idCircuito}/cerrar`)
                .send(cerrarData);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Presidente no autorizado');
        });

        it('debería manejar mesa ya cerrada', async () => {
            mesaService.cerrarMesa.mockRejectedValue(new Error('Mesa ya cerrada'));

            const idCircuito = 2;
            const cerrarData = {
                cedulaPresidente: '12345678'
            };
            
            const response = await request(app)
                .post(`/api/mesas/${idCircuito}/cerrar`)
                .send(cerrarData);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Mesa ya cerrada');
        });
    });

    describe('GET /api/mesas/abiertas', () => {
        it('debería obtener todas las mesas abiertas', async () => {
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

            const response = await request(app)
                .get('/api/mesas/abiertas');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.mesas).toBeDefined();
            expect(Array.isArray(response.body.mesas)).toBe(true);
            expect(response.body.mesas.length).toBe(2);
            
            if (response.body.mesas.length > 0) {
                expect(response.body.mesas[0].Id_circuito).toBe(1);
                expect(response.body.mesas[0].Estado).toBe('Abierta');
                expect(response.body.mesas[0].Departamento).toBe('Montevideo');
                expect(response.body.mesas[0].Ciudad).toBe('Montevideo');
                expect(response.body.mesas[0].Barrio).toBe('Centro');
            }
        });

        it('debería retornar array vacío si no hay mesas abiertas', async () => {
            mesaService.obtenerMesasAbiertas.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/mesas/abiertas');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.mesas).toBeDefined();
            expect(Array.isArray(response.body.mesas)).toBe(true);
            expect(response.body.mesas.length).toBe(0);
        });
    });
});
