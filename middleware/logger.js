// Middleware para logging de requests
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

    next();
};

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', err.stack);
    }

    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
};

module.exports = {
    requestLogger,
    errorHandler
};