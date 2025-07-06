const mysql = require('mysql2/promise');

// Configuración de la conexión
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL');
        await connection.execute('SELECT 1');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        console.log('💡 Verifica:');
        console.log('   1. MySQL está corriendo');
        console.log('   2. Base de datos existe:', process.env.DB_NAME);
        console.log('   3. Credenciales en .env son correctas');
        console.log('   4. Usuario tiene permisos en la base de datos');
        return false;
    }
}

// Función para ejecutar queries
async function executeQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error en query:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    testConnection,
    executeQuery
};