import { AccionNoticia } from "@/api/graphql/COM03";
import { formatLongDate } from "@/helpers/formatLongDate";

interface FlowTexts {
    confirm: { title: string; description: string; align: "center" | "left" };
    loading: { title: string; description: string };
    success: { title: string; description: string; badge?: string; note?: string };
    errorTitle: string;
}

/** Texto común de las pantallas de error (Error al programar / Error al guardar borrador). */
export const ERROR_DESCRIPTION = "Tu contenido no se perdió. Puedes intentarlo de nuevo.";

/** TODO [COM03-BACKEND]: texto provisional del diseño; backend debe definir el código de referencia. */
export const ERROR_REFERENCE = "Código de referencia: [por definir con backend]";

/**
 * Textos de confirmación, carga, éxito y error por acción (Figma, página Comunicación).
 */
export function getFlowTexts(accion: AccionNoticia, fechaPublicacion: string): FlowTexts {
    switch (accion) {
    case AccionNoticia.PROGRAMAR: {
        const fecha = formatLongDate(fechaPublicacion) ?? "la fecha seleccionada";
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
