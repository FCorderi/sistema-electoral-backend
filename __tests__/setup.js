// Configuración global para los tests
// Las variables de entorno se configuran en jest.setup.js

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
