// Configuración global para los tests
// Cargar variables de entorno específicas para testing
// Asegurar que estamos en modo test y no hardcodear valores, trae los valores desde un archivo .env.test
require('dotenv').config({ path: '.env.test' });

// Asegurar que estamos en modo test
process.env.NODE_ENV = 'test';

// Mock de console.log para tests más limpios
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};

// Mock de servicios para tests de integración
const { mockVotanteService, mockEleccionService, mockMesaService } = require('./mocks/services');

jest.mock('../services/votanteService', () => mockVotanteService);
jest.mock('../services/eleccionService', () => mockEleccionService);
jest.mock('../services/mesaService', () => mockMesaService);
