/** Campos con aria-invalid o mensajes de error marcados con data-error="true" */
const ERROR_SELECTOR = '[aria-invalid="true"], [data-error="true"]';

/**
 * Lleva a la vista el primer campo con error dentro del contenedor (en orden del documento)
 * y, si es un campo editable, le pasa el foco.
 * Devuelve false si no encontró ningún error.
 */
export function scrollToFirstError(container: HTMLElement | null): boolean {
    const element = container?.querySelector<HTMLElement>(ERROR_SELECTOR);
    if (!element) return false;

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    if (element.matches("input, textarea, select")) {
        element.focus({ preventScroll: true });
    }

    return true;
}
