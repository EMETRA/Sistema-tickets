export interface Roles {
    id: number;
    code: string;
    name: string;
    roleCode: string;
    status: string;
};

export interface RolesTableProps {
    roles: Roles[];
    className?: string;
};

export type RolesView = "table" | "create";