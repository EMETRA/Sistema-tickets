export interface Modules {
    id: number;
    name: string;
    status: string;
};

export interface ModulesTableProps {
    modules: Modules[];
    className?: string;
};

export type ModulesView = "table" | "create";