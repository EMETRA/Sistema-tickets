import { IconName } from "../../atoms/Icon/types";

export interface TableCellConfig {
    content?: React.ReactNode;
    icon?: IconName; // Solo para el header
    label?: string;  // Solo para el header
    align?: "left" | "center" | "right";
}

export interface TableRowProps {
    cells: TableCellConfig[];
    isHeader?: boolean;
    gridTemplate: string;
    scale?: number;
    className?: string;
}