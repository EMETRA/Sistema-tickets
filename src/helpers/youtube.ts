const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const NOCOOKIE_HOSTS = new Set(["youtube-nocookie.com", "www.youtube-nocookie.com"]);
const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

/**
 * Devuelve el id (11 caracteres) de un video normal de YouTube, o null.
 * Acepta:
 *   - youtube.com/watch?v=ID (también m. y www., con otros parámetros como &t=30)
 *   - youtu.be/ID
 *   - youtube.com/embed/ID y youtube-nocookie.com/embed/ID
 * Rechaza Shorts, transmisiones en vivo (/live/), listas sin video, canales y
 * cualquier otro dominio (decisión de COM-03/COM-04, 2026-09-30).
 * Es la misma regla que usa el Portal (portal-emetra, src/helpers/youtube.ts).
 */
export function parseYouTubeId(url: string | null | undefined): string | null {
    if (!url) return null;

    let parsed: URL;
    try {
        parsed = new URL(url.trim());
    } catch {
        return null;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

    const host = parsed.hostname.toLowerCase();
    const segmentos = parsed.pathname.split("/").filter(Boolean);
    let id: string | null = null;

    if (SHORT_HOSTS.has(host)) {
        if (segmentos.length === 1) id = segmentos[0];
    } else if (YOUTUBE_HOSTS.has(host)) {
        if (segmentos.length === 1 && segmentos[0] === "watch") {
            id = parsed.searchParams.get("v");
        } else if (segmentos.length === 2 && segmentos[0] === "embed") {
            id = segmentos[1];
        }
    } else if (NOCOOKIE_HOSTS.has(host)) {
        if (segmentos.length === 2 && segmentos[0] === "embed") id = segmentos[1];
    }

    return id && VIDEO_ID.test(id) ? id : null;
}

/** URL canónica con la que backend guarda el video: https://www.youtube.com/watch?v=ID */
export function toYouTubeWatchUrl(id: string): string {
    return `https://www.youtube.com/watch?v=${id}`;
}
