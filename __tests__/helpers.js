// Test utilities y helpers comunes
const request = require('supertest');
const app = require('./app');

// Helper para hacer login
async function loginTestUser(credencial = 'TEST001') {
    const response = await request(app)
        .post('/api/votantes/login')
        .send({ credencial });
    
    return response;
}

// Helper para obtener elección activa
async function getEleccionActiva() {
    const response = await request(app)
        .get('/api/elecciones/activa');
    
    return response;
}

// Helper para obtener papeletas
async function getPapeletas(idEleccion) {
    const response = await request(app)
        .get(`/api/elecciones/${idEleccion}/papeletas`);
    
    return response;
}

// Helper para registrar voto
async function registrarVoto(credencial, idPapeleta, idCircuito) {
    const response = await request(app)
        .post('/api/votantes/votar')
        .send({ credencial, idPapeleta, idCircuito });
    
    return response;
}

// Helper para obtener estado de mesa
async function getEstadoMesa(idCircuito) {
    const response = await request(app)
        .get(`/api/mesas/${idCircuito}/estado`);
    
    return response;
}

// Helper para cerrar mesa
async function cerrarMesa(idCircuito, cedulaPresidente) {
    const response = await request(app)
        .post(`/api/mesas/${idCircuito}/cerrar`)
        .send({ cedulaPresidente });
    
    return response;
}

// Helper para obtener resultados
async function getResultados(idCircuito, cedulaSolicitante) {
    const response = await request(app)
        .get(`/api/elecciones/resultados/${idCircuito}`)
        .query({ cedulaSolicitante });
    
    return response;
}

// Helper para verificar estructura de respuesta exitosa
function expectSuccessResponse(response, additionalChecks = {}) {
    expect(response.body.success).toBe(true);
    
    Object.keys(additionalChecks).forEach(key => {
        expect(response.body[key]).toBeDefined();
        if (additionalChecks[key] !== undefined) {
            expect(response.body[key]).toEqual(additionalChecks[key]);
        }
    });
}

// Helper para verificar estructura de respuesta de error
function expectErrorResponse(response, errorMessage, statusCode = 400) {
    expect(response.status).toBe(statusCode);
    expect(response.body.error).toBeDefined();
    if (errorMessage) {
        expect(response.body.error).toBe(errorMessage);
    }
}

// Helper para generar datos de prueba
function generateTestData() {
    return {
        votante: {
            credencial: 'TEST001',
            cedula: '12345678',
            nombre: 'Usuario Test',
            circuito: 1
        },
        voto: {
            credencial: 'TEST001',
            idPapeleta: 1,
            idCircuito: 1
        },
        mesa: {
            idCircuito: 1,
            cedulaPresidente: '87654321'
        }
    };
}

// Helper para limpiar datos de prueba (si es necesario)
async function cleanupTestData() {
    // Implementar limpieza de datos de prueba si es necesario
    // Por ejemplo, resetear votos de test, etc.
}

module.exports = {
    loginTestUser,
    getEleccionActiva,
    getPapeletas,
    registrarVoto,
    getEstadoMesa,
    cerrarMesa,
    getResultados,
    expectSuccessResponse,
    expectErrorResponse,
    generateTestData,
    cleanupTestData
};
