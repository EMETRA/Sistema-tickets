"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./DonutChart.module.scss";
import { DonutChartProps } from "./types";

/**
 * Colores predefinidos del sistema de diseño
 */
const DEFAULT_COLORS = [
  "#FF9100",  // naranja-1
  "#00BC70",  // verde-oscuro-1
  "#FFCE00",  // amarillo-1
  "#E63946",  // rojo-1
  "#1700A5",  // azul-1
  "#97D700",  // verde-claro-1
  "#54C8E8",  // celeste-1
];

/**
 * Custom tooltip para el DonutChart
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: unknown[];
  total: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const data = payload[0] as { name: string; value: number; fill: string };
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className={styles.Tooltip}>
        <p className={styles.TooltipLabel}>{data.name}</p>
        <p className={styles.TooltipValue}>
          {data.value.toLocaleString()} ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Componente de gráfica de dona con leyenda
 *
 * @param {DonutChartProps} props - Las propiedades del componente DonutChart.
 * @returns {JSX.Element} El componente DonutChart renderizado.
 */
export const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  size = 200, 
  strokeWidth = 20,
  className 
}) => {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.label,
      value: item.value,
      fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
  }, [data]);

  // Calcular el total de todos los valores
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Si no hay datos, mostrar un mensaje
  if (total === 0 || data.length === 0) {
    return <div className={styles.EmptyState}>No hay datos para mostrar</div>;
  }

  // Calcular radios para la dona
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius - strokeWidth;

  return (
    <div className={classNames(styles.DonutChartContainer, className)}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={0}
            animationDuration={300}
          />
          <Tooltip content={<CustomTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>

      <div className={styles.Legend}>
        {chartData.map((item, index) => (
          <div key={index} className={styles.LegendItem}>
            <span className={styles.Label}>{item.name}</span>
            <span className={styles.Value} style={{ color: item.fill }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
