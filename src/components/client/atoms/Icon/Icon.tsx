import React from "react";
import { IconProps } from "./types";
import { getIconSrc } from "./iconRegistry";
import styles from "./Icon.module.scss";
import classNames from "classnames";
import Image from "next/image";

export const Icon = ({
    name,
    variant = "action",
    size = 24,
    className,
    active = false,
    color,
    backgroundColor,
    raw = false,
}: IconProps) => {

    const src = getIconSrc(name);
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
            style={
                {
                    backgroundColor: backgroundColor,
                    "--icon-color": color,
                    "--icon-size": `${size}px`,
                    width: backgroundColor ? size * 1.8 : size,
                    height: backgroundColor ? size * 1.8 : size,
                } as React.CSSProperties
            }
        >
            {raw ? (
                <Image src={src} width={size} height={size} alt={name} />
            ) : (
                <div
                    className={styles.iconMask}
                    style={{
                        maskImage: `url(${src})`,
                        WebkitMaskImage: `url(${src})`,
                    }}
                />
            )}
        </div>
    );
};

export default Icon;
