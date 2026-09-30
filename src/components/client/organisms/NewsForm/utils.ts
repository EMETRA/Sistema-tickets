import type { NewsFormFile, NewsFormValues } from "./types";

const MB = 1024 * 1024;

/** "20 MB" para límites enteros; si no, como formatFileSize. */
const formatLimit = (bytes: number) => (bytes % MB === 0 ? `${bytes / MB} MB` : formatFileSize(bytes));

/**
 * Bytes de las imágenes nuevas (con archivo) del formulario: principal, secciones y galería.
 * Las guardadas no traen tamaño y los videos de YouTube no cuentan.
 * `excluir` = recurso que se va a reemplazar (no se suma).
 */
export function newImagesBytes(
    values: Pick<NewsFormValues, "archivoPrincipal" | "secciones" | "galeria">,
    excluir?: NewsFormFile | null,
): number {
    const recursos = [values.archivoPrincipal, ...values.secciones.map((s) => s.imagen), ...values.galeria];
    return recursos.reduce(
        (total, recurso) => (recurso?.file && recurso !== excluir ? total + recurso.file.size : total),
        0,
    );
}

/**
 * Separa, en orden, los archivos que caben en el límite de los que lo superarían.
 * Sin `maxBytes`, todos caben.
 */
export function fitFilesInLimit(
    files: File[],
    usedBytes: number,
    maxBytes?: number,
): { fitting: File[]; tooLarge: File[] } {
    if (maxBytes === undefined) return { fitting: files, tooLarge: [] };
    let used = usedBytes;
    const fitting: File[] = [];
    const tooLarge: File[] = [];
    files.forEach((file) => {
        if (used + file.size <= maxBytes) {
            fitting.push(file);
            used += file.size;
        } else {
            tooLarge.push(file);
        }
    });
    return { fitting, tooLarge };
}

/**
 * Mensaje cuando una o más imágenes no caben en el límite total.
 * TODO [COM03-FLUJO]: texto propuesto (no está en el Figma); lo valida el usuario (diseño).
 */
export function sizeLimitMessage(tooLarge: File[], usedBytes: number, maxBytes: number): string {
    const restante = maxBytes - usedBytes;
    const quien = tooLarge.length === 1
        ? `"${tooLarge[0].name}" supera`
        : `${tooLarge.length} imágenes superan`;
    const disponible = restante > 0
        ? `Quedan ${formatFileSize(restante)} disponibles.`
        : "Ya no queda espacio: quita alguna imagen para agregar otra.";
    return `${quien} el límite de ${formatLimit(maxBytes)} entre todas las imágenes de la noticia. ${disponible}`;
}

/**
 * Formatea un tamaño en bytes: "8.4 MB", "512 KB".
 */
export function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
}

/**
 * Texto secundario de un archivo del formulario:
 * - nuevo: "8.4 MB"
 * - guardado en backend: "Cargado" (los recursos guardados no incluyen tamaño)
 * - video de YouTube: "www.youtube.com/watch?v=ID"
 */
export function fileDescription(file: NewsFormFile): string {
    // Video de YouTube: se muestra el enlace (sin https://).
    if (file.youtubeId) return (file.url ?? "").replace(/^https?:\/\//, "");
    const parts: string[] = [];
    if (file.sizeBytes !== null) parts.push(formatFileSize(file.sizeBytes));
    if (!file.file) parts.push("Cargado");
    return parts.join(" · ");
}

/**
 * Separa los archivos que cumplen el patrón `accept` (p. ej. "image/*,video/*").
 * El input nativo filtra al seleccionar, pero no al arrastrar; por eso se valida aquí.
 */
export function filterAcceptedFiles(files: File[], accept: string): { accepted: File[]; rejected: string[] } {
    const patterns = accept.split(",").map((pattern) => pattern.trim().toLowerCase()).filter(Boolean);
    const accepted: File[] = [];
    const rejected: string[] = [];

    files.forEach((file) => {
        const type = file.type.toLowerCase();
        const name = file.name.toLowerCase();
        const isAccepted = patterns.length === 0 || patterns.some((pattern) => {
            if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
            if (pattern.startsWith(".")) return name.endsWith(pattern);
            return type === pattern;
        });

        if (isAccepted) accepted.push(file);
        else rejected.push(file.name);
    });

    return { accepted, rejected };
}
