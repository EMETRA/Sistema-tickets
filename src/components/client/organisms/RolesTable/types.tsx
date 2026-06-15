import { Permissions } from "../PermissionsTable/types";

export interface Roles {
    id: number;
    code: string;
    name: string;
    roleCode: string;
    description?: string;
    status: string;
    permissions: Permissions[];
};

export interface RolesTableProps {
    roles: Roles[];
    permissions: Permissions[];
    onSubmit?: (data: {name: string; description: string; code: string; permissions: Permissions[]}) => void;
    onEdit?: (data: Roles) => void;
    onDelete?: (id: number) => void;
    className?: string;
};

export type RolesView = "table" | "create" | "edit";