/**
 * Types para MOD06 - Funciones por usuario
 */

export interface FuncionesPorUsuarioAplicacion {
  aplicacion: string;
  nombre: string;
}

export interface FuncionesPorUsuarioEmpresa {
  empresa: string;
  nombre: string;
}

export interface FuncionesPorUsuarioUsuario {
  asignaUsuario: string;
  usuario: string;
}

export interface FuncionPermisoItem {
  funcion: number;
  nombre: string;
  permitido: boolean;
  uso?: string | null;
}

export interface FuncionesPorUsuarioConsultaInput {
  empresa: string;
  asignaUsuario: string;
  aplicacion: string;
}

export interface FuncionesPorUsuarioConsulta {
  aplicacion: string;
  asignaUsuario: string;
  empresa: string;
  funciones: FuncionPermisoItem[];
  totalPermitidas: number;
}

export interface GetFuncionesPorUsuarioAplicacionesResponse {
  funcionesPorUsuarioAplicaciones: FuncionesPorUsuarioAplicacion[];
}

export interface GetFuncionesPorUsuarioEmpresasResponse {
  funcionesPorUsuarioEmpresas: FuncionesPorUsuarioEmpresa[];
}

export interface GetFuncionesPorUsuarioUsuariosResponse {
  funcionesPorUsuarioUsuarios: FuncionesPorUsuarioUsuario[];
}

export interface GetFuncionesPorUsuarioPermisosResponse {
  funcionesPorUsuarioPermisos: FuncionesPorUsuarioConsulta;
}
