export interface Modules {
    id: number;
    name: string;
    description?: string;
    status: string;
};

export interface ModulesTableProps {
    modules: Modules[];
    onSubmit?: (data: {name: string; description: string}) => void;
    onEdit?: (data: Modules) => void;
    onDelete?: (id: number) => void;
    className?: string;
};

export type ModulesView = "table" | "create" | "edit";