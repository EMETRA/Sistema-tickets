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
    onRequestApproveAll: (ids: number[]) => void;
    onRequestApprove: (id: number) => void;
    modules: Modules[];
    onModulesSubmit: (data: {name: string; description: string}) => void;
    onModulesEdit: (data: Modules) => void;
    onModulesDelete: (id: number) => void;
    permissions: Permissions[];
    onPermissionsSubmit: (data: {module: number; name: string; code: string; description: string;}) => void;
    onPermissionsEdit: (data: Permissions) => void;
    onPermissionsDelete: (id: number) => void;
    roles: Roles[];
    onRolesSubmit: (data: {name: string; description: string; code: string; permissions: Permissions[]}) => void;
    onRolesEdit: (data: Roles) => void;
    onRolesDelete: (id: number) => void;
    enrolls: Enroll[];
    onEnrollApproveAll: (ids: number[]) => void;
    onEnrollApprove: (id: number) => void;
    /**
     * Clase CSS adicional.
     */
    className?: string;
    activeView: ConfigManageView;
    onViewChange: (view: ConfigManageView) => void;
    
}