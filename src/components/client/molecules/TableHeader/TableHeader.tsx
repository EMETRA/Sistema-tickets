"use client";

import React from "react";
import classNames from "classnames";
import { Icon } from "../../atoms/Icon";
import { Title } from "../../atoms/Title";
import { TableHeaderProps } from "./types";
import styles from "./TableHeader.module.scss";

/**
 * Componente TableHeader - Muestra un encabezado con ícono y título
 *
 * @param {TableHeaderProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TableHeader renderizado
 */
export const TableHeader: React.FC<TableHeaderProps> = ({
    iconName,
    label,
    className,
}) => {
    return (
        <div className={classNames(styles.TableHeader, className)}>
            <Icon 
                name={iconName} 
                variant="status"
                size={32}
                className={styles.icon}
            />
            <Title variant="mid" tag="h2" className={styles.title}>
                {label}
            </Title>
        </div>
    );
};

export default TableHeader;
