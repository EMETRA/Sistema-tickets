"use client"

import React from "react";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { LineChart } from "../../atoms/LineChart";
import styles from "./MyPerformanceChart.module.scss";
import { MyPerformanceChartProps } from "./types";

export const MyPerformanceChart: React.FC<MyPerformanceChartProps> = ({ data }) => {
  return(
    <div className={classNames(styles.MyPerformanceChart)}>
      <TableHeader label="Mi Rendimiento" iconName="magnifying-glass-chart-solid" />
      <LineChart
        data={data}
        width={600}
        height={300}
        showGrid={true}
        lineColor="#54C8E8"
        areaColor="#B7EBF7"
        strokeWidth={2}
      />
    </div>
  )
}