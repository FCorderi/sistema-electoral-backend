module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    collectCoverageFrom: [
        'controllers/**/*.js',
        'services/**/*.js',
        'routes/**/*.js',
        'config/**/*.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testTimeout: 10000,
    verbose: true,
    detectOpenHandles: true,
    forceExit: true
};
