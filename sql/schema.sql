-- Actualizado
CREATE DATABASE IF NOT EXISTS sistema_electoral;

USE sistema_electoral;

CREATE TABLE Departamento (
    Id_departamento INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100)
);

CREATE TABLE Zona (
    Id_zona INT PRIMARY KEY AUTO_INCREMENT,
    Ciudad VARCHAR(100) NOT NULL,
    Paraje VARCHAR(100) NOT NULL,
    Barrio VARCHAR(100) NOT NULL,
    Id_departamento INT NOT NULL,
    FOREIGN KEY (Id_departamento) REFERENCES Departamento(Id_departamento)
);

CREATE TABLE Circuito (
    Id_circuito INT PRIMARY KEY AUTO_INCREMENT,
    Es_accesible BOOLEAN,
    Numero_inicial_cc_autorizada INT NOT NULL,
    Numero_final_cc_autorizada INT NOT NULL,
    Id_zona INT NOT NULL,
    FOREIGN KEY (Id_zona) REFERENCES Zona(Id_zona)
);

CREATE TABLE Eleccion (
    Id_eleccion INT PRIMARY KEY AUTO_INCREMENT,
    Fecha DATE NOT NULL,
    Esta_activa BOOLEAN
);

CREATE TABLE Eleccion_presidencial (
    Id_eleccion INT PRIMARY KEY,
    FOREIGN KEY (Id_eleccion) REFERENCES Eleccion(Id_eleccion)
);

CREATE TABLE Eleccion_municipal (
    Id_eleccion INT PRIMARY KEY,
    FOREIGN KEY (Id_eleccion) REFERENCES Eleccion(Id_eleccion)
);

CREATE TABLE Eleccion_ballotage (
    Id_eleccion INT PRIMARY KEY,
    FOREIGN KEY (Id_eleccion) REFERENCES Eleccion(Id_eleccion)
);

CREATE TABLE Eleccion_plebicito (
    Id_eleccion INT PRIMARY KEY,
    FOREIGN KEY (Id_eleccion) REFERENCES Eleccion(Id_eleccion)
);

CREATE TABLE Eleccion_referendum (
    Id_eleccion INT PRIMARY KEY,
    FOREIGN KEY (Id_eleccion) REFERENCES Eleccion(Id_eleccion)
);

CREATE TABLE Votante (
    Cedula VARCHAR(8) PRIMARY KEY,
    Nombre_completo TEXT,
    Fecha_nacimiento DATE,
    Credencial VARCHAR(8),
    Id_circuito INT NOT NULL,
    FOREIGN KEY (Id_circuito) REFERENCES Circuito(Id_circuito)
);

CREATE TABLE Miembro_de_mesa (
    Cedula VARCHAR(8) PRIMARY KEY,
    Id_circuito_que_compone INT NOT NULL,
    Organismo VARCHAR(100),
    Rol ENUM('Presidente', 'Secretario', 'Vocal') DEFAULT 'Vocal',
    FOREIGN KEY (Cedula) REFERENCES Votante(Cedula),
    FOREIGN KEY (Id_circuito_que_compone) REFERENCES Circuito(Id_circuito)
);

CREATE TABLE Estado_mesa (
    Id_circuito INT PRIMARY KEY,
    Esta_abierta BOOLEAN DEFAULT TRUE,
    Fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    Fecha_cierre DATETIME NULL,
    Cedula_presidente_cierre VARCHAR(8) NULL,
    FOREIGN KEY (Id_circuito) REFERENCES Circuito(Id_circuito),
    FOREIGN KEY (Cedula_presidente_cierre) REFERENCES Miembro_de_mesa(Cedula)
);

CREATE TABLE Policia (
    Cedula VARCHAR(8) PRIMARY KEY,
    Comisaria VARCHAR(100),
    FOREIGN KEY (Cedula) REFERENCES Votante(Cedula)
);

CREATE TABLE Partido (
    Id_partido INT PRIMARY KEY AUTO_INCREMENT,
    Direccion_sede TEXT,
    Cedula_presidente VARCHAR(8),
    Cedula_vicepresidente VARCHAR(8)
);

CREATE TABLE Politico (
    Cedula VARCHAR(8) PRIMARY KEY,
    Id_partido INT NOT NULL,
    FOREIGN KEY (Cedula) REFERENCES Votante(Cedula),
    FOREIGN KEY (Id_partido) REFERENCES Partido(Id_partido)
);

ALTER TABLE
    Partido
ADD
    FOREIGN KEY (Cedula_presidente) REFERENCES Politico(Cedula);

ALTER TABLE
    Partido
ADD
    FOREIGN KEY (Cedula_vicepresidente) REFERENCES Politico(Cedula);

CREATE TABLE Rol (
    Id_rol INT PRIMARY KEY AUTO_INCREMENT,
    Descripcion TEXT,
    Organo ENUM('Intendente', 'Junta_departamental', 'Consejal')
);

CREATE TABLE Lista (
    Numero INT PRIMARY KEY,
    Id_partido INT NOT NULL,
    Id_eleccion INT NOT NULL,
    Cedula_politico_apoyado VARCHAR(8) NOT NULL,
    FOREIGN KEY (Id_partido) REFERENCES Partido(Id_partido),
    FOREIGN KEY (Id_eleccion) REFERENCES Eleccion(Id_eleccion),
    FOREIGN KEY (Cedula_politico_apoyado) REFERENCES Politico(Cedula)
);

CREATE TABLE Papeleta (
    Id_papeleta INT PRIMARY KEY,
    Color VARCHAR(20),
    Id_eleccion INT NOT NULL,
    Numero_lista INT,
    FOREIGN KEY (Id_eleccion) REFERENCES Eleccion(Id_eleccion),
    FOREIGN KEY (Numero_lista) REFERENCES Lista(Numero)
);

CREATE TABLE Voto (
    Id_voto INT PRIMARY KEY AUTO_INCREMENT,
    Fecha_hora DATETIME,
    Observado BOOLEAN,
    Estado ENUM('Válido', 'En Blanco', 'Anulado') NOT NULL DEFAULT 'Válido',
    Id_circuito INT NOT NULL,
    FOREIGN KEY (Id_circuito) REFERENCES Circuito(Id_circuito)
);

CREATE TABLE Votante_voto (
    Cedula VARCHAR(8) NOT NULL,
    Id_voto INT NOT NULL,
    Fecha_hora DATETIME NOT NULL,
    PRIMARY KEY (Cedula, Id_voto),
    FOREIGN KEY (Cedula) REFERENCES Votante(Cedula),
    FOREIGN KEY (Id_voto) REFERENCES Voto(Id_voto)
);

CREATE TABLE Voto_papeleta (
    Id_voto INT NOT NULL,
    Id_papeleta INT NOT NULL,
    PRIMARY KEY (Id_voto, Id_papeleta),
    FOREIGN KEY (Id_voto) REFERENCES Voto(Id_voto),
    FOREIGN KEY (Id_papeleta) REFERENCES Papeleta(Id_papeleta)
);

CREATE TABLE Politico_lista_rol (
    Cedula_politico VARCHAR(8),
    Numero_lista INT,
    Id_rol INT,
    PRIMARY KEY (Cedula_politico, Numero_lista),
    FOREIGN KEY (Cedula_politico) REFERENCES Politico(Cedula),
    FOREIGN KEY (Numero_lista) REFERENCES Lista(Numero),
    FOREIGN KEY (Id_rol) REFERENCES Rol(Id_rol)
);

CREATE TABLE Papeleta_apoya (
    Id_papeleta INT PRIMARY KEY,
    Cedula_politico VARCHAR(8) NOT NULL,
    Id_rol INT NOT NULL,
    FOREIGN KEY (Id_papeleta) REFERENCES Papeleta(Id_papeleta),
    FOREIGN KEY (Cedula_politico) REFERENCES Politico(Cedula),
    FOREIGN KEY (Id_rol) REFERENCES Rol(Id_rol)
);