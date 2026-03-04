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
    id, // 👈 Añadimos el id aquí
    className 
}: TableRowProps & { id?: string | number }) => { // Extendemos el tipo temporalmente
    
    const finalGridTemplate = selectable 
        ? `minmax(0, 45px) ${gridTemplate}` 
        : gridTemplate;

    return (
        <div 
            className={classNames(
                styles.tableRow, 
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
                        id={`check-${isHeader ? 'header' : id}`} // 👈 ID único por fila
                        checked={isSelected}
                        onChange={(e) => onSelect?.(e.target.checked)}
                        style={{ transform: `scale(${scale})` }}
                    />
                </div>
            )}

            {cells.map((cell, index) => (
                <div key={index} className={classNames(styles.cell, styles[cell.align || "left"])}>
                    {isHeader ? (
                        <div className={styles.headerContent}>
                            {cell.icon && <Icon name={cell.icon} size={Math.round(18 * scale)} />}
                            <Text variant="body" className={styles.headerLabel}>{cell.label}</Text>
                        </div>
                    ) : (
                        <div className={styles.rowContent}>{cell.content}</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TableRow;