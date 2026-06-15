export const GUARDAR_REPORTE_SEMANAL = `
  mutation GuardarReporteSemanal($input: GuardarReporteSemanalInput!) {
    guardarReporteSemanal(input: $input) {
      success
        message
      idReporte
      reporte {
        estadoProyecto
        indProductividad
      }
    }
  }
`;