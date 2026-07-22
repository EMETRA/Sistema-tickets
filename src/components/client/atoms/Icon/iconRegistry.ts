/**
 * Registro de íconos ↔ archivos en /public/svgs.
 *
 * Cómo mantenerlo:
 * 1. Agregar el .svg en public/svgs
 * 2. Agregar el nombre (sin extensión) a ICON_FILES
 *
 * IconName se deriva de ICON_FILES — usar siempre el nombre real del archivo.
 */

/** Nombres de archivo en public/svgs (sin .svg) */
export const ICON_FILES = [
    "adress-book-regular",
    "adress-card-solid",
    "angle-down-solid",
    "angle-left-solid",
    "angle-right-solid",
    "archivo",
    "arrow-down-wide-short-gray",
    "arrow-right-solid",
    "arrows-rotate-solid-full",
    "bank-solid",
    "bell-regular",
    "bookmark-regular",
    "bookmark-solid-full",
    "bullet-list",
    "bus-side-solid",
    "calendar-day-solid",
    "calendar-regular",
    "calendar-week-solid",
    "car-solid",
    "chart-bar-regular",
    "chart-bar-solid",
    "chart-pie-solid",
    "chart-simple-solid",
    "check-slot-solid-full",
    "check-solid",
    "circle-exclamation-solid",
    "circle-user-regular",
    "clipboard-list-solid",
    "clipboard-regular",
    "clipboard-solid",
    "clock-rotate-left-solid",
    "computer-mouse-solid",
    "computer-solid",
    "desktop-solid",
    "docx",
    "ellipsis-vertical-solid",
    "emetra-solid",
    "envelope-circle-check-solid",
    "envelope-regular",
    "eye",
    "eye-off",
    "fax-solid",
    "file",
    "file-arrow-up-solid-full",
    "file-circle-plus-solid",
    "file-excel-regular",
    "file-lines-regular",
    "file-pdf-solid-full",
    "file-pen-solid",
    "filter-solid",
    "floppy-disk-solid",
    "fuente-cursiva",
    "gear-solid",
    "gears-solid",
    "globe",
    "hand-regular",
    "hashtag-solid",
    "home",
    "hourglass-half-solid",
    "house-solid",
    "id-badge-solid",
    "image",
    "in-progress",
    "keyboard-solid",
    "layer-group-solid",
    "letra-b",
    "magnifying-glass-chart-solid",
    "magnifying-glass-solid",
    "network-wired-solid",
    "next",
    "no-user",
    "not-assign-solid",
    "paper-plane-solid",
    "paperclip",
    "papers-solid",
    "pen-to-square-regular",
    "people-group",
    "people-group-solid",
    "person-chalkboard-solid",
    "ppt",
    "print-solid",
    "ranking-star-solid",
    "rotate-left-solid",
    "send",
    "settings",
    "spinner-solid",
    "subrayar",
    "svg",
    "tachado",
    "tag",
    "ticket",
    "ticket-solid",
    "tickets",
    "trash-solid",
    "trash-solid-full",
    "trash-solid-gray",
    "user-add",
    "user-clock-solid",
    "user-group-solid",
    "user-lock-solid",
    "user-regular",
    "user-solid",
    "user-tag-solid",
    "users",
    "users-solid",
    "vercel",
    "window",
    "xlsx",
    "xmark-solid",
] as const;

export type SvgFileName = (typeof ICON_FILES)[number];

/** Nombre de ícono = nombre del archivo SVG (sin .svg) */
export type IconName = SvgFileName;

/** Fallback cuando el nombre no existe (API / typo / vacío). */
export const DEFAULT_ICON_FILE: SvgFileName = "svg";

const ICON_FILE_SET: ReadonlySet<string> = new Set(ICON_FILES);

export function isIconName(value: string): value is IconName {
    return ICON_FILE_SET.has(value);
}

/**
 * Resuelve un nombre al archivo SVG.
 * Solo acepta nombres que existen en ICON_FILES; si no, usa DEFAULT_ICON_FILE.
 */
export function resolveIconFile(name: string): SvgFileName {
    if (!name.trim()) return DEFAULT_ICON_FILE;

    if (isIconName(name)) return name;

    if (process.env.NODE_ENV === "development") {
        console.warn(
            `[Icon] Ícono desconocido "${name}". Usando fallback "${DEFAULT_ICON_FILE}".`
        );
    }

    return DEFAULT_ICON_FILE;
}

/** Ruta pública lista para Image / mask-image. */
export function getIconSrc(name: string): string {
    return `/svgs/${resolveIconFile(name)}.svg`;
}
