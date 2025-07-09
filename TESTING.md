# Ejemplos de Uso de Tests

## Comandos Básicos

### Ejecutar Todos los Tests
```bash
npm test
```

### Ejecutar Tests con Cobertura
```bash
npm test -- --coverage
```

### Ejecutar Tests en Modo Watch
```bash
npm run test:watch
```

## Comandos Específicos

### Tests por Categoría
```bash
# Solo tests de controladores (unitarios)
npm test -- __tests__/controllers/

# Solo tests de rutas (integración)
npm test -- __tests__/routes/

# Solo tests de un controlador específico
npm test -- __tests__/controllers/votanteController.test.js
```

### Tests por Patrón
```bash
# Tests relacionados con votantes
npm test -- --testPathPattern=votante

# Tests relacionados con elecciones
npm test -- --testPathPattern=eleccion

# Tests relacionados con mesas
npm test -- --testPathPattern=mesa
```

### Usando el Test Runner
```bash
# Ejecutar todos los tests
node test-runner.js all

# Ejecutar tests unitarios
node test-runner.js unit

# Ejecutar tests de integración
node test-runner.js integration

# Ejecutar tests de rutas específicas
node test-runner.js routes votante
node test-runner.js routes eleccion
node test-runner.js routes mesa

# Ejecutar tests de controladores específicos
node test-runner.js controllers votante
node test-runner.js controllers eleccion
node test-runner.js controllers mesa

# Ejecutar tests de health check
node test-runner.js health

# Ejecutar tests con cobertura
node test-runner.js coverage
```

## Ejemplos de Salida

### Ejecución Exitosa
```
✓ Votante Endpoints › POST /api/votantes/login › debería hacer login exitoso
✓ Votante Endpoints › POST /api/votantes/votar › debería registrar voto exitosamente
✓ Elección Endpoints › GET /api/elecciones/activa › debería obtener elección activa
✓ Mesa Endpoints › GET /api/mesas/abiertas › debería obtener todas las mesas abiertas

Test Suites: 12 passed, 12 total
Tests:       71 passed, 71 total
Snapshots:   0 total
Time:        2.929 s
```

### Reporte de Cobertura
```
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------|---------|----------|---------|---------|-------------------
All files              |   90.75 |    64.51 |   94.11 |   90.26 |                  
 controllers           |   98.85 |     90.9 |     100 |   98.76 |                  
  eleccionController.js |   97.61 |       80 |     100 |   97.22 | 54              
  mesaController.js     |     100 |      100 |     100 |     100 |                  
  votanteController.js  |     100 |      100 |     100 |     100 |                  
 routes                |     100 |      100 |     100 |     100 |                  
  eleccionRoutes.js     |     100 |      100 |     100 |     100 |                  
  mesaRoutes.js         |     100 |      100 |     100 |     100 |                  
  votanteRoutes.js      |     100 |      100 |     100 |     100 |                  
------------------------|---------|----------|---------|---------|-------------------
```

```bash
# Script que ejecuta todos los test y genera un resumen
node generate-test-report.js
```
node generate-test-report.js

## Desarrollo de Nuevos Tests

### Estructura de un Test de Ruta
```javascript
describe('Nuevo Endpoint', () => {
    it('debería hacer algo exitosamente', async () => {
        // Configurar mocks
        serviceMock.metodo.mockResolvedValue(mockData);
        
        // Hacer request
        const response = await request(app)
            .post('/api/nuevo-endpoint')
            .send(testData);
        
        // Verificar respuesta
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
    });
});
```

### Estructura de un Test de Controlador
```javascript
describe('NuevoController', () => {
    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('debería procesar request exitosamente', async () => {
        // Configurar mocks
        serviceMock.metodo.mockResolvedValue(mockData);
        
        // Ejecutar controlador
        await controller.metodo(req, res);
        
        // Verificar respuesta
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockData
        });
    });
});
```

## Buenas Prácticas

1. **Usar mocks apropiados**: Los servicios deben estar mockeados para tests unitarios
2. **Verificar status codes**: Siempre verificar el código de estado HTTP
3. **Probar casos de error**: Incluir tests para casos de error y validación
4. **Limpiar mocks**: Usar `jest.clearAllMocks()` en `beforeEach`
5. **Datos de prueba consistentes**: Usar datos de prueba consistentes y realistas
6. **Descripción clara**: Usar descripciones claras en los tests

## Solución de Problemas

### Tests Fallando por Timeout
```bash
# Aumentar timeout
npm test -- --testTimeout=15000
```

### Tests Fallando por Handles Abiertos
```bash
# Forzar cierre
npm test -- --forceExit
```

### Ver Tests Específicos en Modo Verbose
```bash
npm test -- --verbose --testPathPattern=votante
```

### Debug de Tests
```bash
# Ejecutar con debug
npm test -- --runInBand --detectOpenHandles --verbose
```
