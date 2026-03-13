import { EquipmentItemProps } from "../../molecules/EquipmentItem/types";

export interface EquipmentReportPanelProps {
    percentage: number;
    statusLabel?: string;
    items: EquipmentItemProps[];
    className?: string;
}