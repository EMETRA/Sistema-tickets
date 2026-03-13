export interface Permissions {
    id: number;
    name: string;
    status: string;
};

export interface PermissionsTableProps {
    permissions: Permissions[];
    className?: string;
};

export type PermissionsView = "table" | "create";