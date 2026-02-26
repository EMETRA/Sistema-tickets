import React from "react";
import { AvatarProps } from "./types";
import styles from "./Avatar.module.scss";
import classNames from "classnames";
import { Image } from "../Image";

export const Avatar = ({ 
    src, 
    initials, 
    size = "md", 
    ringed, 
    status,
    className 
}: AvatarProps) => {
    return (
        <div className={classNames(styles.avatar, styles[size], { [styles.ringed]: ringed }, className)}>
        {src ? (
            <Image src={src} alt="User" width={80} height={80} rounded />
        ) : (
            <span className={styles.initials}>{initials}</span>
        )}
        
        {/* Renderizado condicional del punto de estado */}
        {status && (
            <span className={classNames(styles.statusBadge, styles[status])} />
        )}
        </div>
    );
};
export default Avatar;