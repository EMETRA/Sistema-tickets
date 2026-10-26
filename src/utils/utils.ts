
/**
 * Formatear fecha a formato DD/MM/YYYY
 * @param date - Fecha a formatear
 * @returns Fecha formateada
 */
export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

/**
 * Identificar Link
 * @param link - Link a identificar
 * @returns Link identificado
 */
export const identifyLink = (link: string) => {
    return link.includes("http");
};