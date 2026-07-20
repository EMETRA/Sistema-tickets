import { UserRole } from "@/types/roles";
import { USER_ROLES } from "@/config/constants";

const VALID_ROLES = Object.values(USER_ROLES) as UserRole[];

/**
 * Normaliza un string de rol a UserRole válido.
 * Si no es válido o está vacío, retorna USUARIO.
 */
export function normalizeRole(role?: string | null): UserRole {
    if (!role) return USER_ROLES.USUARIO;

    const roleUpper = role.toUpperCase();
    if (VALID_ROLES.includes(roleUpper as UserRole)) {
        return roleUpper as UserRole;
    }

    return USER_ROLES.USUARIO;
}
