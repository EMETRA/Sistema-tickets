import React, { useMemo } from "react";
import { AvatarProps } from "./types";
import styles from "./Avatar.module.scss";
import classNames from "classnames";
import { Image } from "../Image";

const AVATAR_COLORS = [
    "#99cc33",
    "#6F87FB",
    "#F44336",
    "#FF9800",
    "#9C27B0",
    "#00BCD4",
    "#795548",
];

export const getAvatarColor = (text: string = "") => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

export const Avatar = ({ 
    src, 
    initials, 
    size = "md", 
    ringed, 
    status,
    className 
}: AvatarProps) => {

    // Generamos el color base una sola vez para usarlo en fondo y borde
    const mainColor = useMemo(() => getAvatarColor(initials), [initials]);

    return (
        <div 
            className={classNames(
                styles.avatar, 
                styles[size], 
                { [styles.ringed]: ringed }, 
                className
            )}
            style={{ 
                backgroundColor: mainColor,
                borderColor: ringed ? mainColor : "transparent"
            } as React.CSSProperties}
        >
            {src ? (
                <Image src={src} alt="User" width={80} height={80} rounded />
            ) : (
                <span className={styles.initials}>{initials}</span>
            )}
            
            {status && (
                <span className={classNames(styles.statusBadge, styles[status])} />
            )}
        </div>
    );
};

export default Avatar;