/**
 * Types para MOD07 - Manuales PDF
 */

export enum CategoriaManual {
  EMETRA = 'EMETRA',
  FINANCIERO = 'FINANCIERO',
  NORMAS = 'NORMAS',
  OTROS = 'OTROS',
  PMT = 'PMT',
  SIAF = 'SIAF',
  VEHICULOS = 'VEHICULOS',
}

export interface ManualInfo {
  categoria: CategoriaManual;
  categoriaEtiqueta: string;
  etiquetas?: string[];
  id: number;
  nombreArchivo: string;
  orden: number;
  tamanoBytes: number;
  titulo: string;
  urlVisualizacion: string;
  urlVisualizacionAbsoluta: string;
}

export interface ManualesFilterInput {
  busqueda?: string | null;
  categoria?: CategoriaManual | null;
}

export interface ManualesPorCategoria {
  categoria: CategoriaManual;
  categoriaEtiqueta: string;
  manuales: ManualInfo[];
}

export interface ManualCategoriaResumen {
  codigo: CategoriaManual;
  etiqueta: string;
  total: number;
}

export interface GetManualesCategoriasResponse {
  manualesCategorias: ManualCategoriaResumen[];
}

export interface GetManualesDisponiblesResponse {
  manualesDisponibles: ManualInfo[];
}

export interface GetManualesAgrupadosResponse {
  manualesAgrupados: ManualesPorCategoria[];
}

export interface GetManualResponse {
  manual: ManualInfo;
}
