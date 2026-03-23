/**
 * Módulo Home - Exports
 */

// Query Definitions
export { GET_USER_QUERY, type GetUserResponse } from "./usuario";
export { GET_PERFIL_EQUIPO_QUERY, type GetPerfilEquipoResponse } from "./perfilEquipo";
export { GET_MY_STATS_QUERY, type GetMyStatsResponse } from "./myStats";
export { GET_APPS_BY_ROLE_QUERY, type GetAppsByRoleResponse } from "./appsByRole";

// Types
export type {
    UsuarioPerfil,
    DepartamentoPerfil,
    TicketStats,
    VacationStats,
    MonthlyTicketsPoint,
    MyStats,
    AppLink,
    HomeUsuarioData,
} from "./types";
