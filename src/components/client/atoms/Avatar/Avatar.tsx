import React, { useMemo } from "react";
import { AvatarProps } from "./types";
import styles from "./Avatar.module.scss";
import classNames from "classnames";
import { Image } from "../Image";

const AVATAR_COLORS = ["#99cc33", "#6F87FB", "#F44336", "#FF9800", "#9C27B0", "#00BCD4", "#795548"];

export const getAvatarColor = (text: string = "") => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

/** Blanco o tinta oscura, lo que contraste más con el color del avatar (iniciales legibles). */
export const avatarInk = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return 1.05 / (l + 0.05) >= (l + 0.05) / (0.0137 + 0.05) ? "#ffffff" : "#14223a";
};

export const Avatar = ({ src, initials, size = "md", ringed, status, className }: AvatarProps) => {
    // Generamos el color base una sola vez para usarlo en fondo y borde
    const mainColor = useMemo(() => getAvatarColor(initials), [initials]);

    return (
        <div
            className={classNames(styles.avatar, styles[size], { [styles.ringed]: ringed }, className)}
            style={
                {
                    backgroundColor: mainColor,
                    color: avatarInk(mainColor),
                    borderColor: ringed ? mainColor : "transparent",
                } as React.CSSProperties
            }
        >
            {src ? (
                <Image src={src} alt="User" width={80} height={80} rounded />
            ) : (
                <span className={styles.initials}>{initials}</span>
            )}

            {status && <span className={classNames(styles.statusBadge, styles[status])} />}
        </div>
    );
};

export default Avatar;
