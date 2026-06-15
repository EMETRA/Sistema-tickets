import React from "react";
import { TableRowProps } from "./types";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import styles from "./TableRow.module.scss";
import classNames from "classnames";
import { Checkbox } from "../../atoms/Checkbox";

export const TableRow = ({ 
    cells, 
    isHeader = false, 
    gridTemplate, 
    scale = 1, 
    selectable = false, 
    isSelected = false, 
    onSelect,
    id,
    variant = "default",
    className,
    rowContentClassName
}: TableRowProps) => {

    // Lógica de Grid para la variante de permisos
    const isPermission = variant === "permission";
    
    const finalGridTemplate = isPermission
        ? isHeader
            ? `minmax(0, 45px) 1fr` // El header de permisos suele ser una sola etiqueta
            : `minmax(0, 45px) 1fr repeat(${cells.length - 1}, auto)` // Fila con info y toggles
        : (selectable ? `minmax(0, 45px) ${gridTemplate}` : gridTemplate);

    return (
        <div 
            className={classNames(
                styles.tableRow, 
                styles[variant],
                { [styles.header]: isHeader, [styles.selected]: isSelected }, 
                className
            )}
            style={{ 
                gridTemplateColumns: finalGridTemplate, 
                '--row-scale': scale 
            } as React.CSSProperties}
        >
            {selectable && (
                <div className={classNames(styles.cell, styles.center, styles.checkboxCell)}>
                    <Checkbox 
                        id={`check-${isHeader && isPermission ? `header-${id}` : (isHeader ? 'header' : id)}`}
                        checked={isSelected}
                        onChange={(e) => onSelect?.(e.target.checked)}
                        style={{ transform: `scale(${scale})` }}
                    />
                </div>
            )}

            {cells.map((cell, index) => (
                <div 
                    key={index} 
                    className={classNames(
                        styles.cell, 
                        styles[cell.align || "left"],
                        // Clase especial para la info del permiso (Nombre + Descripción)
                        { [styles.permissionInfo]: isPermission && index === 0 && !isHeader }
                    )}
                >
                    {isHeader ? (
                        <div className={styles.headerContent}>
                            {/* No se muestran iconos si es variante permission */}
                            {!isPermission && cell.icon && (
                                <Icon name={cell.icon} size={Math.round(18 * scale)} />
                            )}
                            <Text variant="body" className={styles.headerLabel}>{cell.label}</Text>
                        </div>
                    ) : (
                        <div className={classNames(styles.rowContent, rowContentClassName)}>
                            {cell.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TableRow;