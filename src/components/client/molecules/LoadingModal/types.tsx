/**
 * Props del componente LoadingModal
 */
export interface LoadingModalProps {
    /**
     * Si el modal está visible
     */
    isOpen: boolean;

    /**
     * Texto principal, p. ej. "Publicando tu noticia"
     */
    title: string;

    /**
     * Texto secundario
     */
    description?: string;

    /**
     * Clase CSS adicional
     */
    className?: string;
}
