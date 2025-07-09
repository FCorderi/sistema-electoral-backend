const request = require('supertest');
const app = require('../app');

// Mock manual para este test específico
jest.mock('../../services/votanteService', () => ({
    obtenerVotantePorCredencial: jest.fn(),
    obtenerRolUsuario: jest.fn(),
    verificarYaVotoPorCredencial: jest.fn(),
    registrarVotoPorCredencial: jest.fn()
}));

jest.mock('../../services/eleccionService', () => ({
    obtenerEleccionActiva: jest.fn()
}));

const votanteService = require('../../services/votanteService');
const eleccionService = require('../../services/eleccionService');

describe('Votante Endpoints', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/votantes/login', () => {
        it('debería hacer login exitoso con credencial válida', async () => {
            const mockVotante = {
                Cedula: '12345678',
                Nombre_completo: 'Test User',
                Credencial: 'TEST001',
                Id_circuito: 1,
                Departamento: 'Montevideo',
                Ciudad: 'Montevideo',
                Barrio: 'Centro'
            };

            votanteService.obtenerVotantePorCredencial.mockResolvedValue(mockVotante);
            votanteService.obtenerRolUsuario.mockResolvedValue('Votante');

            const loginData = {
                credencial: 'TEST001'
            };

            const response = await request(app)
                .post('/api/votantes/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.votante).toBeDefined();
            expect(response.body.votante.cedula).toBe('12345678');
            expect(response.body.votante.nombre).toBe('Test User');
            expect(response.body.votante.credencial).toBe('TEST001');
            expect(response.body.votante.circuito).toBe(1);
            expect(response.body.votante.ubicacion).toBeDefined();
            expect(response.body.votante.rol).toBe('Votante');
        });

        it('debería fallar login con credencial inválida', async () => {
            votanteService.obtenerVotantePorCredencial.mockResolvedValue(null);

            const loginData = {
                credencial: 'INVALID_CREDENTIAL'
            };

            const response = await request(app)
                .post('/api/votantes/login')
                .send(loginData);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Votante no encontrado');
        });

        it('debería fallar login sin credencial', async () => {
            const response = await request(app)
                .post('/api/votantes/login')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Credencial es requerida');
        });

        it('debería fallar login con credencial vacía', async () => {
            const loginData = {
                credencial: ''
            };

            const response = await request(app)
                .post('/api/votantes/login')
                .send(loginData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Credencial es requerida');
        });
    });

    describe('POST /api/votantes/votar', () => {
        beforeEach(() => {
            eleccionService.obtenerEleccionActiva.mockResolvedValue({ Id_eleccion: 1 });
            votanteService.obtenerVotantePorCredencial.mockResolvedValue({ Id_circuito: 1 });
        });

        it('debería registrar voto exitosamente', async () => {
            votanteService.verificarYaVotoPorCredencial.mockResolvedValue(false);
            votanteService.registrarVotoPorCredencial.mockResolvedValue(123);

            const votoData = {
                credencial: 'TEST001',
                idPapeleta: 1,
                idCircuito: 1
            };

            const response = await request(app)
                .post('/api/votantes/votar')
                .send(votoData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Voto registrado exitosamente');
            expect(response.body.idVoto).toBe(123);
            expect(response.body.observado).toBe(false);
        });

        it('debería registrar voto como observado cuando no es su circuito', async () => {
            votanteService.verificarYaVotoPorCredencial.mockResolvedValue(false);
            votanteService.registrarVotoPorCredencial.mockResolvedValue(124);

            const votoData = {
                credencial: 'TEST001',
                idPapeleta: 1,
                idCircuito: 999 // Circuito diferente al asignado
            };

            const response = await request(app)
                .post('/api/votantes/votar')
                .send(votoData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.observado).toBe(true);
            expect(response.body.message).toContain('observado');
        });

        it('debería fallar al votar dos veces con la misma credencial', async () => {
            votanteService.verificarYaVotoPorCredencial.mockResolvedValue(true);

            const votoData = {
                credencial: 'TEST002',
                idPapeleta: 1,
                idCircuito: 1
            };

            const response = await request(app)
                .post('/api/votantes/votar')
                .send(votoData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Ya ha emitido su voto en esta elección');
        });

        it('debería fallar al votar sin credencial', async () => {
            const votoData = {
                idPapeleta: 1,
                idCircuito: 1
            };

            const response = await request(app)
                .post('/api/votantes/votar')
                .send(votoData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it('debería fallar al votar sin idPapeleta', async () => {
            const votoData = {
                credencial: 'TEST001',
                idCircuito: 1
            };

            const response = await request(app)
                .post('/api/votantes/votar')
                .send(votoData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it('debería fallar al votar sin idCircuito', async () => {
            const votoData = {
                credencial: 'TEST001',
                idPapeleta: 1
            };

            const response = await request(app)
                .post('/api/votantes/votar')
                .send(votoData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });
});
