import { AccionNoticia, EstadoNoticia, type NoticiaCmsError } from "@/api/graphql/COM03";
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

/** Referencia cuando el error no trae código ni estado (red, timeout). Texto provisional. */
export const ERROR_REFERENCE = "Código de referencia: sin respuesta del servidor";

/**
 * Referencia para soporte: el código del README (p. ej. "SLUG_IDIOMA_CONFLICT") o, si no trae
 * uno, el estado HTTP (p. ej. "403").
 */
export const errorReference = (error: NoticiaCmsError | null) => {
    const referencia = error?.codigo ?? error?.statusCode;
    return referencia ? `Código de referencia: ${referencia}` : ERROR_REFERENCE;
};

/** Qué permite cada permiso, para explicarlo en el 403 (README, sección 2). */
const ACCION_POR_PERMISO: Record<string, string> = {
    VIVI_NOTICIAS_EDITAR: "guardar o archivar noticias",
    VIVI_NOTICIAS_PUBLICAR: "publicar o programar noticias",
};

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
 * Mensaje según el error del README "Noticias CMS" (sección 5): primero por código y, si no trae
 * uno, por estado HTTP. Sin código ni estado (red, timeout), el texto genérico.
 * TODO [COM03-FLUJO]: estos textos no están en el Figma; los valida el usuario (diseño).
 */
export function getErrorTexts(error: NoticiaCmsError | null): ErrorTexts {
    switch (error?.codigo) {
    // SLUG_IDIOMA_CONFLICT no usa la pantalla de error: se marca en el campo (SLUG_CONFLICT_MESSAGE).
    case "SLUG_IDIOMA_CONFLICT":
        return { description: SLUG_CONFLICT_MESSAGE, retryable: false };
    case "IDEMPOTENCY_CONFLICT":
        // El siguiente intento ya va con otra clave (NewsFormView): reintentar sí funciona.
        return {
            description: "La noticia cambió desde el intento anterior. Tu contenido no se perdió. Inténtalo de nuevo.",
            retryable: true,
        };
    case "NEWS_NOT_FOUND":
        return {
            description: "La noticia que intentas editar ya no existe. Pudo haber sido eliminada.",
            retryable: false,
        };
    }

    switch (error?.statusCode) {
    case 400:
        // Los mensajes de validación de backend ya vienen en español (README).
        return {
            description: error.mensajes.length > 0
                ? `No se pudo guardar: ${error.mensajes.join(" ")}`
                : "Algunos datos no son válidos. Revisa el formulario e inténtalo de nuevo.",
            retryable: false,
        };
    case 401:
        return {
            description: "Tu sesión venció o no es válida. Inicia sesión de nuevo para guardar la noticia.",
            retryable: false,
        };
    case 403: {
        const accion = error.permisoFaltante ? ACCION_POR_PERMISO[error.permisoFaltante] : undefined;
        return {
            description: accion
                ? `No tienes permiso para ${accion}. Pide a un administrador el permiso ${error.permisoFaltante}.`
                : "No tienes permiso para realizar esta acción. Pide a un administrador el permiso necesario.",
            retryable: false,
        };
    }
    case 502:
    case 503:
        return {
            description: "El servicio de noticias no está disponible en este momento. Tu contenido no se perdió. Intenta de nuevo en unos minutos.",
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
 * "Guardar borrador" sobre una noticia ya publicada o programada la saca del Portal o cancela su
 * publicación (se guarda con estado "borrador"). Se avisa en la confirmación y en el éxito.
 * TODO [COM03-FLUJO]: textos propuestos (no están en el Figma); decisión del usuario 2026-10-07.
 */
const BORRADOR_DESDE: Partial<Record<EstadoNoticia, { confirm: string; success: string }>> = {
    [EstadoNoticia.PUBLICADA]: {
        confirm: "Esta noticia está publicada. Al guardarla como borrador dejará de mostrarse en el Portal. La notificación push que ya se envió no se puede deshacer.",
        success: "La noticia ya no se muestra en el Portal. Puedes seguir editándola y volver a publicarla.",
    },
    [EstadoNoticia.PROGRAMADA]: {
        confirm: "Esta noticia está programada. Al guardarla como borrador ya no se publicará en la fecha programada.",
        success: "Ya no se publicará en la fecha programada. Puedes seguir editándola y volver a programarla.",
    },
};

/**
 * Textos de confirmación, carga, éxito y error por acción (Figma, página Comunicación).
 * `estadoActual`: estado guardado de la noticia que se edita (null al crear).
 */
export function getFlowTexts(
    accion: AccionNoticia,
    fechaPublicacion: string,
    estadoActual: EstadoNoticia | null = null,
): FlowTexts {
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
    case AccionNoticia.BORRADOR: {
        const aviso = estadoActual ? BORRADOR_DESDE[estadoActual] : undefined;
        return {
            confirm: {
                title: "¿Guardar como borrador?",
                description: aviso?.confirm ?? "No se publicará ni se enviará push a VIVI. Podrás seguir editándolo después.",
                align: "center",
            },
            loading: {
                title: "Guardando tu borrador...",
                description: "Estamos guardando los cambios. No cierres esta página.",
            },
            success: {
                title: "Borrador guardado",
                description: aviso?.success ?? "Puedes seguir editándolo cuando quieras. No se publicó ni se envió push a VIVI.",
            },
            errorTitle: "No pudimos guardar tu borrador",
        };
    }
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
