/**
 * Descarga un archivo desde una cadena base64 en el navegador.
 *
 * @param base64 - Contenido codificado en base64
 * @param filename - Nombre del archivo que se descargará
 * @param mimeType - Tipo MIME del archivo
 */
export function downloadBase64File(base64: string, filename: string, mimeType: string): void {
    if (!base64) {
        throw new Error('El contenido base64 es requerido para descargar el archivo.');
    }

    if (!filename) {
        throw new Error('El nombre de archivo es requerido para descargar el archivo.');
    }

    const binaryString = atob(base64);
    const buffer = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i += 1) {
        buffer[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
