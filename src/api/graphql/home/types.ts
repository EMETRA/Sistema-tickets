/**
 * Types para módulo Home
 */

/**
 * Usuario actual - Retornado por query usuario
 */
export interface UsuarioPerfil {
  id_usuario: string;
  nombre: string;
  email: string;
  rol?: string;
  departamento?: string;
  avatar?: string;
}

/**
 * Departamento/Equipo del usuario - Retornado por query perfilequipo
 */
export interface DepartamentoPerfil {
  id_departamento: string;
  nombre: string;
}

/**
 * Estadísticas de tickets del usuario
 */
export interface TicketStats {
  ingresados: number;
  asignados: number;
  resueltos: number;
  cerrados: number;
}

/**
 * Estadísticas de vacaciones del usuario
 */
export interface VacationStats {
  dias_disponibles: number;
  dias_usados: number;
}

/**
 * Punto de datos para gráfico mensual de tickets
 */
export interface MonthlyTicketsPoint {
  mes: string;
  tickets: number;
}

/**
 * Estadísticas personalizadas del usuario
 */
export interface MyStats {
  tickets: TicketStats;
  vacaciones: VacationStats;
  zonas_a_cargo: string[];
  grafico_mensual: MonthlyTicketsPoint[];
}

/**
 * Link a aplicación según rol del usuario
 */
export interface AppLink {
  nombre: string;
  icono: string;
  ruta: string;
}

/**
 * Respuesta agregada para Home Usuario
 */
export interface HomeUsuarioData {
  usuario: UsuarioPerfil;
  perfilequipo: DepartamentoPerfil[];
  myStats: MyStats;
  appsByRole: AppLink[];
}
