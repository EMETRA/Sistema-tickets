export interface PermissionToggleProps {
    /** Etiqueta descriptiva del permiso (ej. "Grabar") */
    label: string;
    /** Estado del switch */
    checked?: boolean;
    /** Función de callback para el cambio de estado */
    onChange?: (checked: boolean) => void;
    /** ID único para el input */
    id?: string;
    /** Clases adicionales */
    className?: string;
}