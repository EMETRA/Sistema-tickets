import { Modules } from "../ModulesTable/types";

export interface Permissions {
    id: number;
    name: string;
    module: number;
    code: string;
    description?: string;
    status: string;
    ver?: boolean;
    grabar?: boolean;
    editar?: boolean;
    eliminar?: boolean;
};

export interface PermissionsTableProps {
    permissions: Permissions[];
    modules: Modules[];
    onSubmit?: (data: {module: number; name: string; code: string; description: string;}) => void;
    onEdit?: (data: Permissions) => void;
    onDelete?: (id: number) => void;
    className?: string;
};

export type PermissionsView = "table" | "create" | "edit";