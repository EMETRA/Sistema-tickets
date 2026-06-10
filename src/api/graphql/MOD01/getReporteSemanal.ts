/**
 * Query GraphQL para obtener detalle completo de un reporte semanal
 *
 * Parámetro:
 * - id: ID del reporte a obtener
 *
 * Retorna: Detalle completo con:
 * - Información del colaborador y proyecto
 * - Indicadores y métricas
 * - Lista de tareas planificadas
 * - Lista de tareas completadas
 * - Información de bloqueos
 * - Plan para próxima semana
 */
export const GET_REPORTE_SEMANAL_QUERY = `
  query ReporteSemanal($id: ID!) {
    reporteSemanal(id: $id) {
      id
      idColaborador
      nombreColaborador
      cargo
      jefeInmediato
      proyecto
      fechaInicio
      fechaFin
      horasEstimadasTotal
      horasRealesTotal
      tareasPlanificadas
      tareasCompletadas
      tareasEnFecha
      bloqueosActivos
      avancePlanificado
      avanceReal
      desviacionAvance
      porcAvance
      indProductividad
      indCumplimientoFechas
      indCumplimientoTareas
      indDesviacionHoras
      estadoProyecto
      observaciones
      situacionActual
      createdAt
      tareasPlan {
        id
        descripcion
        estado
        fechaCompromiso
        horasEstimadas
      }
      tareasCompletadasLista {
        id
        descripcion
        horasReales
        fechaFinalizacion
      }
      bloqueo {
        id
        descripcion
        impacto
        accionRequerida
      }
      planProximaSemana {
        id
        descripcion
        horasEstimadas
        fechaCompromiso
      }
    }
  }
`;
