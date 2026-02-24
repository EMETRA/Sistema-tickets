import React from "react";
import Image from "next/image";
import { IconProps } from "./types";
import styles from "./Icon.module.scss";
import classNames from "classnames";

export const Icon = ({ 
    name, 
    variant = "action", 
    size = 24, 
    className,
    active = false // Añadimos esta prop para navegación
    }: IconProps) => {
    return (
        <Image
        src={`/${name}.svg`}
        alt={`${name} icon`}
        width={size}
        height={size}
        // Agregamos la clase condicional de 'active'
        className={classNames(
            styles.icon, 
            styles[variant], 
            { [styles.active]: active }, 
            className
        )}
        />
    );
};

export default Icon;