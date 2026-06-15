/**
 * Query GraphQL para obtener tipos de reportes de anulados
 *
 * Usado para: Select del formulario de reportes anulados
 * Retorna: Lista de tipos disponibles con sus etiquetas
 * 
 * Tipos disponibles:
 * - RECIBOS_PAGO: Recibos de pago anulados
 * - TICKET_PARQUEOS: Tickets de parqueo anulados
 * - PARALELO_FORMAS: Paralelo de formas anuladas
 */
export const GET_REPORTE_ANULADOS_TIPOS_QUERY = `
  query ReporteAnuladosTipos {
    reporteAnuladosTipos {
      codigo
      etiqueta
    }
  }
`;
