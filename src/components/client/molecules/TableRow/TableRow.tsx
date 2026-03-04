import React from "react";
import { TableRowProps } from "./types";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import styles from "./TableRow.module.scss";
import classNames from "classnames";

export const TableRow = ({ cells, isHeader = false, gridTemplate, scale = 1, className }: TableRowProps) => {
    return (
        <div 
            className={classNames(styles.tableRow, { [styles.header]: isHeader }, className)}
            style={{ gridTemplateColumns: gridTemplate, '--row-scale': scale } as React.CSSProperties}
        >
            {cells.map((cell, index) => (
                <div 
                    key={index} 
                    className={classNames(
                        styles.cell, 
                        styles[cell.align || "left"] 
                    )}
                >
                    {isHeader ? (
                        <div className={styles.headerContent}>
                            {cell.icon && <Icon name={cell.icon} size={Math.round(18 * scale)} />}
                            <Text variant="body" className={styles.headerLabel}>
                                {cell.label}
                            </Text>
                        </div>
                    ) : (
                        <div className={styles.rowContent}>
                            {cell.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TableRow;