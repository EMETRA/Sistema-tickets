"use client";

import React from "react";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { BarChart } from "../../atoms/BarChart";
import { ReportTableProps } from "./types";
import styles from "./ReportTable.module.scss";

export const ReportTable: React.FC<ReportTableProps> = ({
    title,
    iconName,
    data,
    width = 700,
    height = 400,
    className,
    }) => {
    return (
        <article className={classNames(styles.ReportTable, className)}>
        <div className={styles.header}>
            <TableHeader
                iconName={iconName}
                label={title}
                className={styles.headerTitle}
            />
        </div>

        <div className={styles.chartContainer}>
            <BarChart
                data={data}
                width={width}
                height={height}
                colorScheme="green-gradient"
                verticalLabels
            />
        </div>
        </article>
    );
};

export default ReportTable;