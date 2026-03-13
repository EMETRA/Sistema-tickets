import { BarChartDataPoint } from "../../atoms/BarChart";

export interface ReportTableProps {
    title: string;
    iconName: string;
    data: BarChartDataPoint[];
    width?: number;
    height?: number;
    className?: string;
}