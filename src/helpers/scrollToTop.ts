/**
 * Sube al inicio el contenedor con scroll más cercano al elemento.
 * En el layout del sistema el scroll no es de `window` sino del <main> de SystemLayout,
 * así que se busca el ancestro que realmente hace scroll. Si no hay ninguno, usa `window`.
 */
export function scrollToTop(element: HTMLElement | null): void {
    let current = element?.parentElement ?? null;

    while (current) {
        const { overflowY } = window.getComputedStyle(current);
        const isScrollable = overflowY === "auto" || overflowY === "scroll";
        if (isScrollable && current.scrollHeight > current.clientHeight) {
            current.scrollTo({ top: 0 });
            return;
        }
        current = current.parentElement;
    }

    window.scrollTo({ top: 0 });
}
