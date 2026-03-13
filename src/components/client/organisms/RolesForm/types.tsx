export interface Permissions {
    id: number;
    name: string;
    description: string;
    grabar: boolean;
    editar: boolean;
    eliminar: boolean;
    ver: boolean;
}

export interface RolesFormProps {
    permissions: Permissions[];
    onSubmit?: () => void;
    onCancel?: () => void;
    className?: string;
};