/**
 * Propiedades de la molécula YouTubeLinkField.
 */
export interface YouTubeLinkFieldProps {
    /**
     * id del input (para el label)
     */
    id: string;

    /**
     * Texto sobre el campo
     * @default "¿Es un video? Pega el enlace de YouTube"
     */
    label?: string;

    /**
     * @default "Agregar video"
     */
    buttonLabel?: string;

    disabled?: boolean;

    /**
     * Se llama con un enlace válido: URL normalizada (https://www.youtube.com/watch?v=ID) e id.
     * Después el campo se vacía.
     */
    onAdd: (url: string, youtubeId: string) => void;

    className?: string;
}
