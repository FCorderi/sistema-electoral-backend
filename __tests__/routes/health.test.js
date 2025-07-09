const request = require('supertest');
const app = require('../app');

describe('Health Check Endpoint', () => {
    
    describe('GET /health', () => {
        it('debería responder con status OK', async () => {
            const response = await request(app)
                .get('/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('OK');
            expect(response.body.message).toBe('Sistema Electoral API funcionando');
        });

        it('debería responder rápidamente', async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get('/health');

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(response.status).toBe(200);
            expect(responseTime).toBeLessThan(1000); // Menos de 1 segundo
        });
    });
});
