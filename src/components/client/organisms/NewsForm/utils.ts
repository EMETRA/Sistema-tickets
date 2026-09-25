import type { NewsFormFile } from "./types";

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
 */
export function fileDescription(file: NewsFormFile): string {
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
