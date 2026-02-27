"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import styles from "./LineChart.module.scss";
import { LineChartProps } from "./types";

// CustomTooltip componente para mostrar información detallada
const CustomTooltip = (props: unknown) => {
  const tooltipProps = props as { 
    active?: boolean; 
    payload?: Array<{ 
      payload?: { name?: string; value?: number }
    }> 
  };
  const { active, payload } = tooltipProps;

  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className={styles.Tooltip}>
        <p className={styles.TooltipLabel}>{data?.name}</p>
        <p className={styles.TooltipValue}>{data?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

/**
 * Componente de gráfica de línea con área rellena
 *
 * @param {LineChartProps} props - Las propiedades del componente LineChart.
 * @returns {JSX.Element} El componente LineChart renderizado.
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 600,
  height = 300,
  showGrid = true,
  lineColor = "#54C8E8",
  areaColor = "#B7EBF7",
  strokeWidth = 2,
  className,
}) => {
  // Transformar datos al formato esperado por Recharts
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.label,
        value: item.value,
      })),
    [data]
  );

  // Si no hay datos, mostrar un mensaje
  if (!data || data.length === 0) {
    return <div className={styles.EmptyState}>No hay datos para mostrar</div>;
  }

  return (
    <div className={classNames(styles.LineChartContainer, className)}>
      <ResponsiveContainer width={width} height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#ccc" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#ccc" }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "5 5" }}
          />
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity={0.8} />
              <stop offset="100%" stopColor={areaColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#areaGradient)"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={strokeWidth}
            dot={{ r: 4, fill: lineColor }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
