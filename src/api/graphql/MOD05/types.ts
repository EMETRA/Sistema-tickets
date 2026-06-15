/**
 * Types para MOD05 - Reporte general RRHH
 */

export enum CampoEmpleadoRh {
  AFILIACION_IGSS = 'AFILIACION_IGSS',
  AGENTE = 'AGENTE',
  CC = 'CC',
  CEDULA = 'CEDULA',
  CORREO_ELECTRONICO = 'CORREO_ELECTRONICO',
  DIRECCION = 'DIRECCION',
  DPI = 'DPI',
  EDAD = 'EDAD',
  EMPLEADO = 'EMPLEADO',
  ESTADO_CIVIL = 'ESTADO_CIVIL',
  ESTATUS = 'ESTATUS',
  FECHA_INGRESO = 'FECHA_INGRESO',
  FECHA_NAC = 'FECHA_NAC',
  FTE_FTO = 'FTE_FTO',
  FUNCIONAL = 'FUNCIONAL',
  NIT = 'NIT',
  PARTIDA_PRESUP = 'PARTIDA_PRESUP',
  PRIMER_APELLIDO = 'PRIMER_APELLIDO',
  PRIMER_NOMBRE = 'PRIMER_NOMBRE',
  PUESTO = 'PUESTO',
  RENGLON = 'RENGLON',
  SEGUNDO_APELLIDO = 'SEGUNDO_APELLIDO',
  SEGUNDO_NOMBRE = 'SEGUNDO_NOMBRE',
  SEXO = 'SEXO',
  SPERSONAL = 'SPERSONAL',
  SPUESTO = 'SPUESTO',
  STOTAL = 'STOTAL',
  TELEFONO = 'TELEFONO',
  TERCER_NOMBRE = 'TERCER_NOMBRE',
  TIPO_SANGRE = 'TIPO_SANGRE',
  UNIDAD = 'UNIDAD',
}

export enum EstatusEmpleadoRh {
  ACTIVO = 'ACTIVO',
  BAJA = 'BAJA',
  SUSPENDIDO = 'SUSPENDIDO',
}

export interface ReporteRhCampoInfo {
  codigo: CampoEmpleadoRh;
  etiqueta: string;
}

export interface ReporteRhEstatusInfo {
  codigo: EstatusEmpleadoRh;
  etiqueta: string;
}

export interface ReporteRhInput {
  estatus: EstatusEmpleadoRh;
  fechaIngresoDesde?: string | null;
  fechaIngresoHasta?: string | null;
  campos: CampoEmpleadoRh[];
}

export interface ReporteRhExcelExport {
  contentBase64: string;
  filename: string;
  mimeType: string;
  totalFilas: number;
}

export interface ReporteRhValorCelda {
  campo: CampoEmpleadoRh;
  etiqueta: string;
  valor?: string | null;
}

export interface ReporteRhFila {
  celdas: ReporteRhValorCelda[];
}

export interface ReporteRhResultados {
  camposSeleccionados: CampoEmpleadoRh[];
  estatus: EstatusEmpleadoRh;
  fechaIngresoDesde?: string | null;
  fechaIngresoHasta?: string | null;
  filas: ReporteRhFila[];
  total: number;
}

export interface GetReporteRhCamposDisponiblesResponse {
  reporteRhCamposDisponibles: ReporteRhCampoInfo[];
}

export interface GetReporteRhEstatusOpcionesResponse {
  reporteRhEstatusOpciones: ReporteRhEstatusInfo[];
}

export interface GetReporteRhResultadosResponse {
  reporteRhResultados: ReporteRhResultados;
}

export interface GetReporteRhExportExcelResponse {
  reporteRhExportExcel: ReporteRhExcelExport;
}
