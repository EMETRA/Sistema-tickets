export interface Modules {
    id: number;
    name: string;
};

export interface PermissionsFormProps {
    modules: Modules[];
    onSubmit?: () => void;
    onCancel?: () => void;
    className?: string;
}