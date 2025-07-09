// Mock de servicios para tests
const mockVotanteService = {
    obtenerVotantePorCredencial: jest.fn(),
    obtenerRolUsuario: jest.fn(),
    verificarYaVotoPorCredencial: jest.fn(),
    registrarVotoPorCredencial: jest.fn()
};

const mockEleccionService = {
    obtenerEleccionActiva: jest.fn(),
    obtenerPapeletas: jest.fn(),
    obtenerResultadosCircuito: jest.fn(),
    obtenerResultadosDepartamento: jest.fn(),
    obtenerResultadosNacionales: jest.fn()
};

const mockMesaService = {
    obtenerEstadoMesa: jest.fn(),
    cerrarMesa: jest.fn(),
    obtenerMesasAbiertas: jest.fn()
};

// Configurar respuestas por defecto
mockVotanteService.obtenerVotantePorCredencial.mockResolvedValue({
    Cedula: '12345678',
    Nombre_completo: 'Test User',
    Credencial: 'TEST001',
    Id_circuito: 1,
    Departamento: 'Montevideo',
    Ciudad: 'Montevideo',
    Barrio: 'Centro'
});

mockVotanteService.obtenerRolUsuario.mockResolvedValue('Votante');
mockVotanteService.verificarYaVotoPorCredencial.mockResolvedValue(false);
mockVotanteService.registrarVotoPorCredencial.mockResolvedValue(123);

mockEleccionService.obtenerEleccionActiva.mockResolvedValue({
    Id_eleccion: 1,
    Titulo: 'Elección Test',
    Fecha_inicio: '2023-01-01',
    Fecha_fin: '2023-12-31'
});

mockEleccionService.obtenerPapeletas.mockResolvedValue([
    { Id_papeleta: 1, Nombre_lista: 'Lista A', Numero_lista: 1 },
    { Id_papeleta: 2, Nombre_lista: 'Lista B', Numero_lista: 2 }
]);

mockEleccionService.obtenerResultadosCircuito.mockResolvedValue({
    resultados: [
        { Nombre_lista: 'Lista A', CantidadVotos: 100 },
        { Nombre_lista: 'Lista B', CantidadVotos: 50 }
    ],
    estadoMesa: { Estado: 'Abierta' }
});

mockEleccionService.obtenerResultadosDepartamento.mockResolvedValue([
    { Nombre_lista: 'Lista A', CantidadVotos: 200 },
    { Nombre_lista: 'Lista B', CantidadVotos: 100 }
]);

mockEleccionService.obtenerResultadosNacionales.mockResolvedValue([
    { Nombre_lista: 'Lista A', CantidadVotos: 1000 },
    { Nombre_lista: 'Lista B', CantidadVotos: 500 }
]);

mockMesaService.obtenerEstadoMesa.mockResolvedValue({
    Id_circuito: 1,
    Estado: 'Abierta',
    Departamento: 'Montevideo',
    Ciudad: 'Montevideo',
    Barrio: 'Centro'
});

mockMesaService.cerrarMesa.mockResolvedValue();

mockMesaService.obtenerMesasAbiertas.mockResolvedValue([
    {
        Id_circuito: 1,
        Estado: 'Abierta',
        Departamento: 'Montevideo',
        Ciudad: 'Montevideo',
        Barrio: 'Centro'
    }
]);

module.exports = {
    mockVotanteService,
    mockEleccionService,
    mockMesaService
};
