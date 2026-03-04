import { IconName } from "../../atoms/Icon/types";

export interface TableCellConfig {
    content?: React.ReactNode;
    icon?: IconName; 
    label?: string;  
    align?: "left" | "center" | "right";
}

export interface TableRowProps {
    cells: TableCellConfig[];
    isHeader?: boolean;
    gridTemplate: string;
    scale?: number;
    className?: string;
    selectable?: boolean;
    isSelected?: boolean;
    onSelect?: (checked: boolean) => void;
    variant?: "default" | "permission"; 
    id?: string | number;
}