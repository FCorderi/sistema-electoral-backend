const request = require('supertest');
const app = require('./app');

// Mock manual para este test específico
jest.mock('../services/eleccionService', () => ({
    obtenerEleccionActiva: jest.fn(),
    obtenerPapeletas: jest.fn(),
    obtenerResultadosNacionales: jest.fn()
}));

jest.mock('../services/mesaService', () => ({
    obtenerMesasAbiertas: jest.fn()
}));

const eleccionService = require('../services/eleccionService');
const mesaService = require('../services/mesaService');

describe('Sistema Electoral Backend - Integration Tests', () => {
    
    beforeAll(async () => {
        // Setup inicial si es necesario
        console.log('Iniciando tests de integración...');
        
        // Configurar mocks por defecto
        eleccionService.obtenerEleccionActiva.mockResolvedValue({
            Id_eleccion: 1,
            Titulo: 'Elección Test',
            Fecha_inicio: '2023-01-01',
            Fecha_fin: '2023-12-31'
        });

        eleccionService.obtenerPapeletas.mockResolvedValue([
            { Id_papeleta: 1, Nombre_lista: 'Lista A', Numero_lista: 1 },
            { Id_papeleta: 2, Nombre_lista: 'Lista B', Numero_lista: 2 }
        ]);

        eleccionService.obtenerResultadosNacionales.mockResolvedValue([
            { Nombre_lista: 'Lista A', CantidadVotos: 1000 },
            { Nombre_lista: 'Lista B', CantidadVotos: 500 }
        ]);

        mesaService.obtenerMesasAbiertas.mockResolvedValue([
            {
                Id_circuito: 1,
                Estado: 'Abierta',
                Departamento: 'Montevideo',
                Ciudad: 'Montevideo',
                Barrio: 'Centro'
            }
        ]);
    });

    afterAll(async () => {
        // Cleanup después de todos los tests
        console.log('Finalizando tests de integración...');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('API Status', () => {
        it('debería estar disponible la API', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
        });
    });

    describe('Endpoints Integration', () => {
        it('debería permitir flujo completo de votación', async () => {
            // Este test simula un flujo completo de votación
            // 1. Verificar que hay una elección activa
            const eleccionResponse = await request(app)
                .get('/api/elecciones/activa');
            
            expect(eleccionResponse.status).toBe(200);
            expect(eleccionResponse.body.success).toBe(true);
            expect(eleccionResponse.body.eleccion).toBeDefined();
            
            // 2. Obtener papeletas de la elección
            const papeletasResponse = await request(app)
                .get(`/api/elecciones/${eleccionResponse.body.eleccion.Id_eleccion}/papeletas`);
            
            expect(papeletasResponse.status).toBe(200);
            expect(papeletasResponse.body.success).toBe(true);
            expect(Array.isArray(papeletasResponse.body.papeletas)).toBe(true);
            expect(papeletasResponse.body.papeletas.length).toBe(2);
        });

        it('debería permitir consultar estado de mesas', async () => {
            // Verificar que podemos obtener mesas abiertas
            const mesasResponse = await request(app)
                .get('/api/mesas/abiertas');
            
            expect(mesasResponse.status).toBe(200);
            expect(mesasResponse.body.success).toBe(true);
            expect(Array.isArray(mesasResponse.body.mesas)).toBe(true);
            expect(mesasResponse.body.mesas.length).toBe(1);
        });

        it('debería permitir consultar resultados nacionales', async () => {
            const resultadosResponse = await request(app)
                .get('/api/elecciones/resultados/nacionales');
            
            expect(resultadosResponse.status).toBe(200);
            expect(resultadosResponse.body.success).toBe(true);
            expect(Array.isArray(resultadosResponse.body.resultados)).toBe(true);
            expect(typeof resultadosResponse.body.totalVotos).toBe('number');
            expect(resultadosResponse.body.totalVotos).toBe(1500);
        });
    });

    describe('Error Handling', () => {
        it('debería manejar endpoints inexistentes', async () => {
            const response = await request(app)
                .get('/api/nonexistent');
            
            expect(response.status).toBe(404);
        });

        it('debería manejar métodos HTTP no permitidos', async () => {
            const response = await request(app)
                .delete('/health');
            
            expect(response.status).toBe(404);
        });

        it('debería manejar JSON malformado', async () => {
            const response = await request(app)
                .post('/api/votantes/login')
                .send('{"malformed": json}')
                .set('Content-Type', 'application/json');
            
            expect(response.status).toBe(400);
        });
    });
});
