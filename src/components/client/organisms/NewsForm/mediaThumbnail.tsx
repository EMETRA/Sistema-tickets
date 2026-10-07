import { PlayBadge } from "../../atoms/PlayBadge";
import type { NewsFormFile } from "./types";

/**
 * Miniatura para FileItem: un video de YouTube se muestra con el recuadro ▶ (no tiene
 * extensión de la que sacar el ícono). Para imágenes devuelve undefined (ícono por extensión).
 */
export const mediaThumbnail = (file: NewsFormFile) =>
    file.youtubeId ? <PlayBadge size="sm" /> : undefined;
