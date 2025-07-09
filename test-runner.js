#!/usr/bin/env node

// Script para ejecutar tests específicos
const { spawn } = require('child_process');

const testType = process.argv[2];
const testFile = process.argv[3];

function runTest(pattern) {
    const args = ['test', '--detectOpenHandles'];
    if (pattern) {
        args.push('--testPathPattern');
        args.push(pattern);
    }
    
    const child = spawn('npm', args, { 
        stdio: 'inherit',
        shell: true 
    });
    
    child.on('close', (code) => {
        process.exit(code);
    });
}

function showUsage() {
    console.log(`
Uso: node test-runner.js <tipo> [archivo]

Tipos disponibles:
  all            - Ejecutar todos los tests
  unit           - Ejecutar tests unitarios (controladores)
  integration    - Ejecutar tests de integración (rutas)
  routes         - Ejecutar tests de rutas específicas
  controllers    - Ejecutar tests de controladores específicos
  health         - Ejecutar tests de health check
  coverage       - Ejecutar tests con cobertura

Ejemplos:
  node test-runner.js all
  node test-runner.js unit
  node test-runner.js integration
  node test-runner.js routes votante
  node test-runner.js controllers eleccion
  node test-runner.js coverage
`);
}

switch (testType) {
    case 'all':
        runTest();
        break;
    case 'unit':
        runTest('controllers');
        break;
    case 'integration':
        runTest('routes');
        break;
    case 'routes':
        if (testFile) {
            runTest(`routes/${testFile}`);
        } else {
            runTest('routes');
        }
        break;
    case 'controllers':
        if (testFile) {
            runTest(`controllers/${testFile}`);
        } else {
            runTest('controllers');
        }
        break;
    case 'health':
        runTest('health');
        break;
    case 'coverage':
        const child = spawn('npm', ['test', '--', '--coverage'], { 
            stdio: 'inherit',
            shell: true 
        });
        child.on('close', (code) => {
            process.exit(code);
        });
        break;
    default:
        showUsage();
        break;
}
