/**
 * Reuniones virtuales: el API guarda el enlace en «lugar» (texto libre), así
 * que la modalidad se deduce del contenido sin cambiar el esquema.
 */
const URL_RE = /https?:\/\/[^\s<>"']+/i;

export function meetingLink(lugar: unknown): string | null {
    const match = String(lugar ?? "").match(URL_RE);
    if (!match) return null;
    try {
        const url = new URL(match[0].replace(/[),.;]+$/, ""));
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
        return null;
    }
}

const PROVIDERS: [RegExp, string][] = [
    [/teams\.(microsoft|live)\.com/i, "Microsoft Teams"],
    [/meet\.google\.com/i, "Google Meet"],
    [/zoom\.(us|com)/i, "Zoom"],
    [/webex\.com/i, "Webex"],
    [/meet\.jit\.si/i, "Jitsi"],
];

export function meetingProvider(link: string) {
    return PROVIDERS.find(([re]) => re.test(link))?.[1] || "Videollamada";
}

/** Texto del lugar sin el enlace (p. ej. «Sala de juntas» en una reunión híbrida). */
export function meetingPlace(lugar: unknown) {
    return String(lugar ?? "")
        .replace(URL_RE, "")
        .replace(/[\s·|,-]+$/g, "")
        .replace(/^[\s·|,-]+/g, "")
        .trim();
}

export function isValidMeetingUrl(value: string) {
    try {
        const url = new URL(value.trim());
        return url.protocol === "https:" && !!url.hostname.includes(".");
    } catch {
        return false;
    }
}
