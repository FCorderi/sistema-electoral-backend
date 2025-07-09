# Tests del Sistema Electoral Backend

Este directorio contiene todos los tests automatizados para el backend del sistema electoral.

## Estructura de Tests

```
__tests__/
├── app.js                          # Aplicación de test (sin servidor)
├── setup.js                        # Configuración global de tests
├── integration.test.js             # Tests de integración
├── helpers.js                      # Utilidades de testing
├── controllers/                    # Tests de controladores
│   ├── eleccionController.test.js
│   ├── mesaController.test.js
│   └── votanteController.test.js
├── routes/                         # Tests de rutas/endpoints
│   ├── eleccionRoutes.test.js
│   ├── health.test.js
│   ├── mesaRoutes.test.js
│   └── votanteRoutes.test.js
├── mocks/                         # Mocks para servicios
│   └── services.js
└── README.md                      # Documentación detallada
```

## Tipos de Tests

### 1. Tests de Rutas (Integration Tests)
- Testean los endpoints completos
- Verifican status codes, estructura de respuesta
- Prueban casos de éxito y error
- Ubicados en `__tests__/routes/`

### 2. Tests de Controladores (Unit Tests)
- Testean la lógica de negocio de cada controlador
- Usan mocks para los servicios
- Verifican manejo de errores
- Ubicados en `__tests__/controllers/`

### 3. Tests de Integración
- Testean flujos completos de la aplicación
- Verifican interacción entre componentes
- Ubicados en `__tests__/integration.test.js`

## Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar tests específicos
npm test -- --testPathPattern=votante
npm test -- --testPathPattern=eleccion
npm test -- --testPathPattern=mesa

# Ejecutar solo tests de rutas
npm test -- __tests__/routes/

# Ejecutar solo tests de controladores
npm test -- __tests__/controllers/
```

## Endpoints Testeados

### Votante Endpoints
- `POST /api/votantes/login` - Login de votante
- `POST /api/votantes/votar` - Registro de voto

### Elección Endpoints
- `GET /api/elecciones/activa` - Obtener elección activa
- `GET /api/elecciones/:idEleccion/papeletas` - Obtener papeletas
- `GET /api/elecciones/resultados/nacionales` - Resultados nacionales
- `GET /api/elecciones/resultados/departamento/:idDepartamento` - Resultados por departamento
- `GET /api/elecciones/resultados/:idCircuito` - Resultados por circuito

### Mesa Endpoints
- `GET /api/mesas/:idCircuito/estado` - Estado de mesa
- `POST /api/mesas/:idCircuito/cerrar` - Cerrar mesa
- `GET /api/mesas/abiertas` - Mesas abiertas

### Health Check
- `GET /health` - Verificación de estado del servidor

## Configuración

### Variables de Entorno para Tests
```javascript
NODE_ENV=test
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_pasword
DB_NAME=sistema_electoral_test
PORT=3002
```

### Configuración de Jest
- Timeout: 10 segundos
- Detecta handles abiertos
- Genera reportes de coverage
- Usa mocks para servicios

## Casos de Prueba Principales

### Casos de Éxito
- Login exitoso con credenciales válidas
- Registro de voto exitoso
- Obtención de resultados
- Consulta de estado de mesas

### Casos de Error
- Credenciales inválidas
- Votación duplicada
- Parámetros faltantes
- Recursos no encontrados
- Errores de base de datos

### Casos Especiales
- Votos observados (fuera de circuito)
- Mesas cerradas
- Cálculo de porcentajes
- Manejo de JSON malformado

## Mocks y Stubs

Los tests de controladores usan mocks para:
- Servicios de base de datos
- Operaciones externas
- Respuestas HTTP

Esto permite testing aislado y rápido de la lógica de negocio.

## Consideraciones

### Base de Datos
- Los tests de integración requieren conexión a base de datos de test
- Los tests unitarios usan mocks y no requieren BD
- Considerar usar base de datos en memoria para tests

### Datos de Prueba
- Usar datos consistentes para tests
- Implementar setup/teardown si es necesario
- Considerar usar fixtures para datos de prueba

### Performance
- Tests diseñados para ser rápidos
- Mocks reducen dependencias externas
- Timeout configurado a 10 segundos

## Extensiones Futuras

- Tests de servicios
- Tests de base de datos
- Tests de performance
- Tests de seguridad
- Tests end-to-end con Cypress/Playwright
