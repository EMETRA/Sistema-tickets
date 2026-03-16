import { Modules } from "../ModulesTable/types";
import { Request } from "../RequestTable/types";
import { Permissions } from "../PermissionsTable/types";
import { Roles } from "../RolesTable/types";
import { Enroll } from "../EnrollTable/types";

export type ConfigManageView = 
    | "requests"
    | "permissions"
    | "roles"
    | "modules"
    | "enroll";

/**
 * Propiedades del componente ConfigurationManagement.
 */
export interface ConfigurationManagementProps {
    requests: Request[];
    modules: Modules[];
    permissions: Permissions[];
    roles: Roles[];
    enrolls: Enroll[];
    /**
     * Clase CSS adicional.
     */
    className?: string;
    
}