const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Convierte texto plano (de un textarea) a HTML simple y seguro:
 * - cada bloque separado por una línea en blanco → <p>
 * - cada salto de línea simple → <br>
 * - se escapan los caracteres especiales (no se puede inyectar HTML)
 *
 * Ejemplo: "Hola\nmundo\n\nOtro" → "<p>Hola<br>mundo</p><p>Otro</p>"
 */
export function textToHtml(text: string): string {
    return text
        .replace(/\r\n/g, "\n")
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => `<p>${block.split("\n").map(escapeHtml).join("<br>")}</p>`)
        .join("");
}

/**
 * Convierte el HTML guardado a texto plano para editarlo en un textarea.
 * Es el camino inverso de textToHtml: párrafos → línea en blanco, <br> → salto de línea.
 * Cualquier otra etiqueta se descarta y se conserva solo su texto.
 */
export function htmlToText(html: string): string {
    const text = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p\s*>/gi, "\n\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");

    return text.replace(/\n{3,}/g, "\n\n").trim();
}
