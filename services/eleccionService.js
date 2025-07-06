const { pool, executeQuery } = require("../config/database")
const mesaService = require("./mesaService")

class EleccionService {
    async obtenerEleccionActiva() {
        try {
            const query = "SELECT * FROM Eleccion WHERE Esta_activa = TRUE LIMIT 1";
            const rows = await executeQuery(query);
            return rows[0];
        } catch (error) {
            throw new Error("Error al obtener elección activa: " + error.message)
        }
    }

    async obtenerPapeletas(idEleccion) {
        try {
            const query = `
        SELECT p.*, l.Numero as NumeroLista, pt.Direccion_sede,
               pol.Nombre_completo as NombreCandidato
        FROM Papeleta p
        LEFT JOIN Lista l ON p.Numero_lista = l.Numero
        LEFT JOIN Partido pt ON l.Id_partido = pt.Id_partido
        LEFT JOIN Politico pol_rel ON l.Cedula_politico_apoyado = pol_rel.Cedula
        LEFT JOIN Votante pol ON pol_rel.Cedula = pol.Cedula
        WHERE p.Id_eleccion = ?
        ORDER BY p.Id_papeleta
      `;

            const rows = await executeQuery(query, [idEleccion]);
            return rows;
        } catch (error) {
            throw new Error("Error al obtener papeletas: " + error.message)
        }
    }

    async obtenerResultadosCircuito(idCircuito, cedulaSolicitante) {
        try {
            // Verificar que la mesa está cerrada antes de mostrar resultados
            const estadoMesa = await mesaService.obtenerEstadoMesa(idCircuito)
            if (!estadoMesa) {
                throw new Error("Circuito no encontrado")
            }

            if (estadoMesa.Esta_abierta) {
                // Solo el presidente de mesa puede ver resultados parciales
                const esPresidente = await mesaService.verificarPresidenteMesa(cedulaSolicitante, idCircuito)
                if (!esPresidente) {
                    throw new Error("Los resultados solo están disponibles cuando la mesa está cerrada")
                }
            }

            const query = `
        SELECT p.Color, p.Tipo, COUNT(v.Id_voto) as CantidadVotos
        FROM Papeleta p
        JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
        LEFT JOIN Voto v ON p.Id_papeleta = v.Id_papeleta AND v.Id_circuito = ?
        WHERE e.Esta_activa = TRUE
        GROUP BY p.Id_papeleta
        ORDER BY CantidadVotos DESC
      `;

            const rows = await executeQuery(query, [idCircuito]);
            return { resultados: rows, estadoMesa };
        } catch (error) {
            throw new Error("Error al obtener resultados del circuito: " + error.message)
        }
    }

    async obtenerResultadosDepartamento(idDepartamento) {
        try {
            const query = `
        SELECT p.Color, p.Tipo, COUNT(v.Id_voto) as CantidadVotos
        FROM Papeleta p
        JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
        LEFT JOIN Voto v ON p.Id_papeleta = v.Id_papeleta
        LEFT JOIN Circuito c ON v.Id_circuito = c.Id_circuito
        LEFT JOIN Zona z ON c.Id_zona = z.Id_zona
        WHERE e.Esta_activa = TRUE AND z.Id_departamento = ?
        GROUP BY p.Id_papeleta
        ORDER BY CantidadVotos DESC
      `;

            const rows = await executeQuery(query, [idDepartamento]);
            return rows;
        } catch (error) {
            throw new Error("Error al obtener resultados del departamento: " + error.message)
        }
    }

    async obtenerResultadosNacionales() {
        try {
            const query = `
        SELECT p.Color, p.Tipo, COUNT(v.Id_voto) as CantidadVotos
        FROM Papeleta p
        JOIN Eleccion e ON p.Id_eleccion = e.Id_eleccion
        LEFT JOIN Voto v ON p.Id_papeleta = v.Id_papeleta
        WHERE e.Esta_activa = TRUE
        GROUP BY p.Id_papeleta
        ORDER BY CantidadVotos DESC
      `;

            const rows = await executeQuery(query);
            return rows;
        } catch (error) {
            throw new Error("Error al obtener resultados nacionales: " + error.message)
        }
    }
}

module.exports = new EleccionService()