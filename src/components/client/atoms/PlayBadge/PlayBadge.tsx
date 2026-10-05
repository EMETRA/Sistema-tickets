import classNames from "classnames";
import styles from "./PlayBadge.module.scss";
import { PlayBadgeProps } from "./types";

/**
 * Indicador de video (▶). Es decorativo: el texto accesible lo pone el componente que lo usa.
 * El triángulo se dibuja con CSS porque ICON_FILES no tiene ícono de reproducir.
 * - sm: recuadro oscuro con el círculo, para listas de archivos.
 * - md: solo el círculo blanco, para centrarlo sobre un recuadro de video.
 */
const PlayBadge: React.FC<PlayBadgeProps> = ({ size = "md", className }) => (
    <span className={classNames(styles.PlayBadge, styles[size], className)} aria-hidden="true">
        <span className={styles.circle}>
            <span className={styles.triangle} />
        </span>
    </span>
);

export default PlayBadge;
