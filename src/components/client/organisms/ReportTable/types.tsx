import { BarChartDataPoint } from "../../atoms/BarChart";
import type { IconNameInput } from "../../atoms/Icon/types";

export interface ReportTableProps {
    title: string;
    iconName: IconNameInput;
    data: BarChartDataPoint[];
    width?: number;
    height?: number;
    className?: string;
}
