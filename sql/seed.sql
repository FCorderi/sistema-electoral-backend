-- Usar la base de datos creada
USE sistema_electoral;

-- Insertar departamentos
INSERT INTO
    Departamento (Nombre)
VALUES
    ('Montevideo'),
    ('Canelones'),
    ('Maldonado'),
    ('Colonia');

-- Insertar zonas
INSERT INTO
    Zona (Ciudad, Paraje, Barrio, Id_departamento)
VALUES
    ('Montevideo', 'Centro', 'Ciudad Vieja', 1),
    ('Montevideo', 'Centro', 'Cordón', 1),
    ('Canelones', 'Las Piedras', 'Centro', 2),
    ('Maldonado', 'Punta del Este', 'Peninsula', 3);

-- Insertar circuitos
INSERT INTO
    Circuito (
        Es_accesible,
        Numero_inicial_cc_autorizada,
        Numero_final_cc_autorizada,
        Id_zona
    )
VALUES
    (TRUE, 100000, 110000, 1),
    (TRUE, 110001, 120000, 2),
    (FALSE, 120001, 130000, 3),
    (TRUE, 130001, 140000, 4);

-- Insertar estados iniciales de las mesas (todas abiertas)
INSERT INTO
    Estado_mesa (Id_circuito, Esta_abierta, Fecha_apertura)
VALUES
    (1, TRUE, '2025-05-11 08:00:00'),
    (2, TRUE, '2025-05-11 08:00:00'),
    (3, TRUE, '2025-05-11 08:00:00'),
    (4, TRUE, '2025-05-11 08:00:00');

-- Insertar elección
INSERT INTO
    Eleccion (Fecha, Esta_activa)
VALUES
    ('2025-05-11', TRUE);

INSERT INTO
    Eleccion_municipal (Id_eleccion)
VALUES
    (1);

-- Insertar roles
INSERT INTO
    Rol (Descripcion, Organo)
VALUES
    ('Candidato a Intendente', 'Intendente'),
    ('Candidato a Edil', 'Junta_departamental'),
    ('Candidato a Concejal', 'Consejal');

-- Insertar partidos
INSERT INTO
    Partido (Direccion_sede)
VALUES
    ('Av. 18 de Julio 1234, Montevideo'),
    ('Bulevar Artigas 567, Montevideo'),
    ('Rambla República de México 890, Montevideo');

-- Insertar algunos votantes de ejemplo
INSERT INTO
    Votante (
        Cedula,
        Nombre_completo,
        Fecha_nacimiento,
        Credencial,
        Id_circuito
    )
VALUES
    (
        '12345678',
        'Juan Pérez García',
        '1985-03-15',
        '105000',
        1
    ),
    (
        '87654321',
        'María González López',
        '1990-07-22',
        '115000',
        2
    ),
    (
        '11111111',
        'Carlos Rodríguez Silva',
        '1978-12-10',
        '125000',
        3
    ),
    (
        '22222222',
        'Ana Martínez Fernández',
        '1995-05-08',
        '135000',
        4
    ),
    (
        '33333333',
        'Pedro López Martín',
        '1982-09-20',
        '106000',
        1
    ),
    (
        '44444444',
        'Laura Fernández Castro',
        '1988-11-15',
        '116000',
        2
    ),
    (
        '55555555',
        'Diego Sánchez Ruiz',
        '1975-04-30',
        '126000',
        3
    ),
    (
        '66666666',
        'Carmen Vega Torres',
        '1992-12-05',
        '136000',
        4
    );

-- Insertar políticos
INSERT INTO
    Politico (Cedula, Id_partido)
VALUES
    ('12345678', 1),
    ('87654321', 2),
    ('11111111', 3);

-- Actualizar presidentes de partidos
UPDATE
    Partido
SET
    Cedula_presidente = '12345678'
WHERE
    Id_partido = 1;

UPDATE
    Partido
SET
    Cedula_presidente = '87654321'
WHERE
    Id_partido = 2;

UPDATE
    Partido
SET
    Cedula_presidente = '11111111'
WHERE
    Id_partido = 3;

-- Insertar listas
INSERT INTO
    Lista (
        Numero,
        Id_partido,
        Id_eleccion,
        Cedula_politico_apoyado
    )
VALUES
    (1, 1, 1, '12345678'),
    (2, 2, 1, '87654321'),
    (3, 3, 1, '11111111');

-- Insertar papeletas
INSERT INTO
    Papeleta (Id_papeleta, Color, Id_eleccion, Numero_lista)
VALUES
    (1, 'Azul', 1, 1),
    (2, 'Rojo', 1, 2),
    (3, 'Verde', 1, 3),
    (4, 'Blanco', 1, NULL);

-- Papeleta en blanco
-- Insertar miembros de mesa con roles específicos
INSERT INTO
    Miembro_de_mesa (Cedula, Id_circuito_que_compone, Organismo, Rol)
VALUES
    -- Presidentes de mesa
    (
        '22222222',
        1,
        'Ministerio de Educación',
        'Presidente'
    ),
    (
        '33333333',
        2,
        'Ministerio de Salud',
        'Presidente'
    ),
    (
        '44444444',
        3,
        'Ministerio de Trabajo',
        'Presidente'
    ),
    (
        '55555555',
        4,
        'Ministerio de Interior',
        'Presidente'
    ),
    -- Secretarios
    ('66666666', 1, 'ANEP', 'Secretario'),
    ('12345678', 2, 'MSP', 'Secretario'),
    ('87654321', 3, 'MTSS', 'Secretario'),
    ('11111111', 4, 'MI', 'Secretario');

-- Insertar algunos datos adicionales para pruebas más completas
-- Más votantes para tener variedad en las pruebas
INSERT INTO
    Votante (
        Cedula,
        Nombre_completo,
        Fecha_nacimiento,
        Credencial,
        Id_circuito
    )
VALUES
    (
        '77777777',
        'Roberto Silva Méndez',
        '1980-06-12',
        '107000',
        1
    ),
    (
        '88888888',
        'Patricia Morales Vega',
        '1985-08-25',
        '117000',
        2
    ),
    (
        '99999999',
        'Fernando Castro López',
        '1990-03-18',
        '127000',
        3
    ),
    (
        '10101010',
        'Silvia Ramírez Díaz',
        '1987-10-08',
        '137000',
        4
    );

-- Insertar algunos policías de ejemplo
INSERT INTO
    Policia (Cedula, Comisaria)
VALUES
    ('77777777', '1ra Comisaría Montevideo'),
    ('88888888', '2da Comisaría Canelones'),
    ('99999999', '1ra Comisaría Maldonado'),
    ('10101010', '1ra Comisaría Colonia');

-- Comentarios informativos
-- IMPORTANTE: Las mesas están configuradas para abrirse el 11 de mayo de 2025 a las 8:00 AM
-- Los presidentes de mesa son:
-- Circuito 1: Ana Martínez Fernández (22222222)
-- Circuito 2: Pedro López Martín (33333333)  
-- Circuito 3: Laura Fernández Castro (44444444)
-- Circuito 4: Diego Sánchez Ruiz (55555555)
-- Para pruebas, puedes usar cualquiera de estas cédulas:
-- Votantes comunes: 12345678, 87654321, 11111111, 77777777, 88888888, 99999999, 10101010
-- Presidentes de mesa: 22222222, 33333333, 44444444, 55555555
-- Secretarios de mesa: 66666666, 12345678, 87654321, 11111111