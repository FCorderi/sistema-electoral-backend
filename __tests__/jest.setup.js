// Variables de entorno para tests - Se ejecuta ANTES que setup.js
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = ''; // Sin contraseña para tests
process.env.DB_NAME = 'sistema_electoral_test';
process.env.PORT = '3002';

// Configuración de tiempo de espera y verbosidad para los tests
process.env.TEST_TIMEOUT = '10000'; // 10 segundos
process.env.TEST_VERBOSE = 'true'; // Verbosidad activada, verbosidad es true por defecto en Jest
