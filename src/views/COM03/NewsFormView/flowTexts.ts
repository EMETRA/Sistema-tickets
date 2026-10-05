import { AccionNoticia, type CodigoErrorNoticiaCms } from "@/api/graphql/COM03";
import { ddMmYyyyToIsoDate } from "@/helpers/dateInput";
import { formatLongDate } from "@/helpers/formatLongDate";

interface FlowTexts {
    confirm: { title: string; description: string; align: "center" | "left" };
    loading: { title: string; description: string };
    success: { title: string; description: string; badge?: string; note?: string };
    errorTitle: string;
}

/** Texto común de las pantallas de error (Error al programar / Error al guardar borrador). */
export const ERROR_DESCRIPTION = "Tu contenido no se perdió. Puedes intentarlo de nuevo.";

/** Referencia cuando el error no trae código (red, timeout). Texto provisional del diseño. */
export const ERROR_REFERENCE = "Código de referencia: [por definir con backend]";

/** Con código del README, la referencia es ese código (p. ej. "SLUG_IDIOMA_CONFLICT"). */
export const errorReference = (codigo: CodigoErrorNoticiaCms | null) =>
    codigo ? `Código de referencia: ${codigo}` : ERROR_REFERENCE;

/**
 * Error del campo "URL (slug)" cuando backend responde SLUG_IDIOMA_CONFLICT.
 * TODO [COM03-FLUJO]: texto provisional (no está en el Figma).
 */
export const SLUG_CONFLICT_MESSAGE =
    "Ya existe una noticia con esta URL en el mismo idioma. Cámbiala para continuar.";

export interface ErrorTexts {
    description: string;
    /**
     * false = reintentar con los mismos datos volvería a fallar (backend rechazó el contenido):
     * se ofrece volver al formulario en lugar de "Reintentar".
     */
    retryable: boolean;
}

/**
 * Mensaje por código de error del README. Sin código (red, timeout), el texto genérico.
 * TODO [COM03-FLUJO]: estos textos no están en el Figma; validarlos con diseño.
 */
export function getErrorTexts(codigo: CodigoErrorNoticiaCms | null): ErrorTexts {
    switch (codigo) {
    // SLUG_IDIOMA_CONFLICT no usa la pantalla de error: se marca en el campo (SLUG_CONFLICT_MESSAGE).
    case "SLUG_IDIOMA_CONFLICT":
        return { description: SLUG_CONFLICT_MESSAGE, retryable: false };
    case "VALIDATION_ERROR":
        return {
            description: "Algunos datos no son válidos. Revisa el formulario e inténtalo de nuevo.",
            retryable: false,
        };
    case "NEWS_NOT_PUBLISHABLE":
        return {
            description: "La noticia no se puede publicar: debe ser pública y tener una fecha de hoy o anterior. Revisa la visibilidad y la fecha.",
            retryable: false,
        };
    case "NEWS_NOT_FOUND":
        return {
            description: "La noticia que intentas editar ya no existe. Pudo haber sido eliminada.",
            retryable: false,
        };
    case "PUBLISH_TRANSACTION_FAILED":
        return {
            description: "No se pudo completar la publicación y la noticia no quedó visible. Tu contenido no se perdió. Puedes intentarlo de nuevo.",
            retryable: true,
        };
    case "INTERNAL_UNAUTHORIZED":
        return {
            description: "Hubo un problema de comunicación entre los sistemas; no es un error de tu formulario. Intenta de nuevo en unos minutos.",
            retryable: true,
        };
    default:
        return { description: ERROR_DESCRIPTION, retryable: true };
    }
}

/**
 * Éxito de "Publicar" cuando backend responde `resultado: "guardada"`: la noticia quedó como
 * publicada pero no es visible (es privada) y no se envía push (README).
 * TODO [COM03-FLUJO]: pantalla que no está en el Figma; texto provisional, validar con diseño.
 */
export const PUBLICADA_NO_VISIBLE_SUCCESS: FlowTexts["success"] = {
    title: "Noticia guardada",
    description: "Quedó como publicada, pero no es visible en el Portal porque es privada. No se envió push a VIVI.",
};

/**
 * Textos de confirmación, carga, éxito y error por acción (Figma, página Comunicación).
 */
export function getFlowTexts(accion: AccionNoticia, fechaPublicacion: string): FlowTexts {
    switch (accion) {
    case AccionNoticia.PROGRAMAR: {
        const fechaIso = ddMmYyyyToIsoDate(fechaPublicacion);
        const fecha = (fechaIso && formatLongDate(fechaIso)) ?? "la fecha seleccionada";
        return {
            confirm: {
                title: "¿Programar esta noticia?",
                description: `La noticia se programará para publicarse el ${fecha}. Ese día se hará visible en el Portal y se iniciará el envío del push a VIVI por separado. Puedes editarla o cancelarla antes de esa fecha.`,
                align: "left",
            },
            loading: { title: "Programando tu noticia", description: "Esto tomará unos segundos" },
            success: {
                title: "Noticia programada",
                description: "Puedes verificar su estado en el listado de noticias.",
            },
            errorTitle: "No pudimos programar la noticia",
        };
    }
    case AccionNoticia.BORRADOR:
        return {
            confirm: {
                title: "¿Guardar como borrador?",
                description: "No se publicará ni se enviará push a VIVI. Podrás seguir editándolo después.",
                align: "center",
            },
            loading: {
                title: "Guardando tu borrador...",
                description: "Estamos guardando los cambios. No cierres esta página.",
            },
            success: {
                title: "Borrador guardado",
                description: "Puedes seguir editándolo cuando quieras. No se publicó ni se envió push a VIVI.",
            },
            errorTitle: "No pudimos guardar tu borrador",
        };
    case AccionNoticia.PUBLICAR:
    default:
        return {
            confirm: {
                title: "¿Publicar esta noticia?",
                description: "La noticia se hará visible en el Portal de inmediato. La notificación push a VIVI se procesa por separado y puede tardar unos minutos. Esta acción no se puede deshacer desde aquí.",
                align: "left",
            },
            loading: {
                title: "Publicando tu noticia",
                description: "Se enviará el push a VIVI en unos segundos.",
            },
            success: {
                title: "Noticia publicada",
                description: "Ya está visible en el Portal.",
                badge: "Notificación pendiente de envío",
                note: "Puedes consultar si ya se envió desde el listado de noticias.",
            },
            errorTitle: "No pudimos publicar la noticia",
        };
    }
}
