import React from "react";
import { IconProps } from "./types";
import styles from "./Icon.module.scss";
import classNames from "classnames";

export const Icon = ({ 
    name, 
    variant = "action", 
    size = 24, 
    className,
    active = false,
    color,
    backgroundColor
    }: IconProps) => {

    const isCustom = !!(color || backgroundColor);

    return (
        <div 
            className={classNames(
                styles.container,
                { [styles.hasBg]: backgroundColor },
                !isCustom && styles[variant],
                !isCustom && { [styles.active]: active },
                className
            )}
            style={{ 
                backgroundColor: backgroundColor,
                '--icon-color': color,
                '--icon-size': `${size}px`,
                width: backgroundColor ? size * 1.8 : size,
                height: backgroundColor ? size * 1.8 : size,
            } as React.CSSProperties}
        >
            <div 
                className={styles.iconMask}
                style={{ 
                    maskImage: `url(/svgs/${name}.svg)`,
                    WebkitMaskImage: `url(/svgs/${name}.svg)`,
                }}
            />
        </div>
    );
};

export default Icon;