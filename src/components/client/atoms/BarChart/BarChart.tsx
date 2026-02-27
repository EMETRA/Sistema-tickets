"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import styles from "./BarChart.module.scss";
import { BarChartProps } from "./types";

/**
 * Gradientes de colores del sistema de diseño
 */
const COLOR_GRADIENTS = {
  "green-gradient": [
    "#00BC70", // verde-oscuro-1
    "#31CD8D", // verde-oscuro-5
    "#97D700", // verde-claro-1
    "#AEE32A", // verde-claro-5
    "#C5EF54", // verde-claro-9
    "#FFCE00", // amarillo-1
  ],
  "blue-gradient": [
    "#54C8E8", // celeste-1
    "#80D8EE", // celeste-5
    "#4361EE", // azul-5
    "#3229B9", // azul-3
    "#697BE1", // azul-7
    "#92B9FF", // azul-10
  ],
  "multi-color": [
    "#FF9100", // naranja-1
    "#00BC70", // verde-oscuro-1
    "#FFCE00", // amarillo-1
    "#E63946", // rojo-1
    "#1700A5", // azul-1
    "#97D700", // verde-claro-1
    "#54C8E8", // celeste-1
  ],
};

/**
 * Componente de gráfica de barras
 *
 * @param {BarChartProps} props - Las propiedades del componente BarChart.
 * @returns {JSX.Element} El componente BarChart renderizado.
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 700,
  height = 400,
  rounded = false,
  showFullGrid = false,
  verticalLabels = false,
  colorScheme = "blue-gradient",
  singleColor = "#4361EE",
  className,
}) => {
  // Calcular colores para las barras
  const barsWithColors = useMemo(() => {
    if (!data || data.length === 0) return [];

    let colors: string[];
    if (colorScheme === "single") {
      colors = Array(data.length).fill(singleColor);
    } else {
      const gradient = COLOR_GRADIENTS[colorScheme];
      colors = data.map((_, index) => {
        const gradientIndex = Math.floor((index / data.length) * gradient.length);
        return gradient[Math.min(gradientIndex, gradient.length - 1)];
      });
    }

    return data.map((item, index) => ({
      ...item,
      color: item.color || colors[index],
    }));
  }, [data, colorScheme, singleColor]);

  // Si no hay datos
  if (!data || data.length === 0) {
    return <div className={styles.EmptyState}>No hay datos para mostrar</div>;
  }

  const radius = rounded ? 25 : 10;

  // Shape personalizado para aplicar colores individuales
  const customShape = (props: unknown) => {
    const shapeProps = props as { fill: string; index: number };
    const { fill, index } = shapeProps;
    const barColor = barsWithColors[index]?.color || fill;

    return (
      <Rectangle
        {...shapeProps}
        fill={barColor}
        radius={[radius, radius, 0, 0]}
        className={styles.Bar}
      />
    );
  };

  return (
    <div className={classNames(styles.BarChartContainer, className)}>
      <ResponsiveContainer width={width} height={height}>
        <RechartsBarChart
          data={barsWithColors}
          margin={{ 
            top: 20, 
            right: 20, 
            bottom: verticalLabels ? 100 : 50, 
            left: 20 
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E4E4E4"
            vertical={showFullGrid}
            horizontal={true}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#262626", fontSize: 12 }}
            angle={verticalLabels ? -45 : 0}
            textAnchor={verticalLabels ? "end" : "middle"}
            height={verticalLabels ? 100 : 50}
            interval={0}
            dy={verticalLabels ? 10 : 0}
            stroke="#A9A9A9"
          />
          <YAxis
            tick={{ fill: "#262626", fontSize: 12 }}
            stroke="#A9A9A9"
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#262626",
              border: "none",
              borderRadius: 4,
              opacity: 0.9,
            }}
            labelStyle={{ color: "white", fontSize: 11, fontWeight: 400 }}
            itemStyle={{ color: "white", fontSize: 14, fontWeight: 600 }}
            formatter={(value: number | undefined) => 
              value !== undefined ? value.toLocaleString() : ""
            }
          />
          <Bar
            dataKey="value"
            shape={customShape}
            animationDuration={300}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
