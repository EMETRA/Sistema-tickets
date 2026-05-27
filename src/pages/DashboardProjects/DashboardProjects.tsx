"use client";

import React, { useState } from "react";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import styles from "./DashboardProjects.module.scss";
import StatusCard from "@/components/client/molecules/StatusCard";
import { Text } from "@/components/client/atoms/Text";
import { BarChart } from "@/components/client/atoms/BarChart";
import { TableRow } from "@/components/client/molecules/TableRow";
import type { TableCellConfig } from "@/components/client/molecules/TableRow/types";
import StatusChip from "@/components/client/atoms/StatusChip";

// DUMMY DATA - REPLACE WITH REAL QUERY

interface ProjectRow {
    colaborador: string;
    proyecto: string;
    fechaInicio: string;
    fechaFin: string;
    avancePlan: string;
    avanceReal: string;
    desvAvance: string;
    cumplTareas: string;
    cumplFechas: string;
    desvHoras: string;
    prod: number;
    bloqueos: number;
    estado: "verde" | "amarillo" | "rojo";
    situacion: string;
}

const GRID = "minmax(0,1fr) minmax(0,1.5fr) minmax(0,0.8fr) minmax(0,0.8fr) minmax(0,0.7fr) minmax(0,0.7fr) minmax(0,0.7fr) minmax(0,0.7fr) minmax(0,0.7fr) minmax(0,0.7fr) minmax(0,0.5fr) minmax(0,0.6fr) minmax(0,0.8fr) minmax(0,2fr)";

const DUMMY_DATA: ProjectRow[] = [
    {
        colaborador: "Rudy Juarez",
        proyecto: "Sistema Integrado de Transporte Público",
        fechaInicio: "09/12/2026",
        fechaFin: "13/12/2026",
        avancePlan: "0%",
        avanceReal: "0%",
        desvAvance: "0%",
        cumplTareas: "80%",
        cumplFechas: "100%",
        desvHoras: "0%",
        prod: 92,
        bloqueos: 1,
        estado: "amarillo",
        situacion: "El proyecto presenta avance parcial con desviaciones moderadas.",
    },
    {
        colaborador: "Erick Guerra",
        proyecto: "APP REM",
        fechaInicio: "18/05/2026",
        fechaFin: "23/05/2026",
        avancePlan: "30%",
        avanceReal: "30%",
        desvAvance: "0%",
        cumplTareas: "100%",
        cumplFechas: "0%",
        desvHoras: "0%",
        prod: 70,
        bloqueos: 0,
        estado: "rojo",
        situacion: "El proyecto presenta atrasos relevantes respecto a lo planificado.",
    },
    {
        colaborador: "Daniel Morales",
        proyecto: "Migración procesos",
        fechaInicio: "18/05/2026",
        fechaFin: "22/05/2026",
        avancePlan: "5%",
        avanceReal: "5%",
        desvAvance: "0%",
        cumplTareas: "100%",
        cumplFechas: "100%",
        desvHoras: "0%",
        prod: 100,
        bloqueos: 0,
        estado: "verde",
        situacion: "El proyecto presenta avance conforme a lo planificado.",
    },
];

const headers: TableCellConfig[] = [
    { label: "Colaborador" },
    { label: "Proyecto" },
    { label: "Fecha Inicio" },
    { label: "Fecha Fin" },
    { label: "Avance Plan" },
    { label: "Avance Real" },
    { label: "Desv. Avance" },
    { label: "% Cumpl. Tareas" },
    { label: "% Cumpl. Fechas" },
    { label: "% Desv. Horas" },
    { label: "Prod." },
    { label: "Bloqueos" },
    { label: "Estado" },
    { label: "Situación Actual" },
];

const DashboardProjects: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    // TODO: replace with real query using desde/hasta
    const stats = {
        verde: 55,
        amarillo: 17,
        rojo: 30,
    };

    // Map stats to BarChart format with explicit colors
    const chartData = [
        { label: "Verde", value: stats.verde, color: "#4a7c3f" },
        { label: "Amarillo", value: stats.amarillo, color: "#c9922a" },
        { label: "Rojo", value: stats.rojo, color: "#b53a3a" },
    ];

    const handleConsultar = () => {
        console.log({ desde, hasta });
        // TODO: refetch query with date range
    };

    return (
        <div className={styles.mainContainer}>

            {/* Filter bar */}
            <div className={styles.filterBar}>
                <div className={styles.filterField}>
                    <Text className={styles.filterLabel}>Desde:</Text>
                    <Input
                        id="desde"
                        type="date"
                        value={desde}
                        onChange={(e) => setDesde(e.target.value)}
                    />
                </div>
                <div className={styles.filterField}>
                    <Text className={styles.filterLabel}>Hasta:</Text>
                    <Input
                        id="hasta"
                        type="date"
                        value={hasta}
                        onChange={(e) => setHasta(e.target.value)}
                    />
                </div>
                <Button variant="contained" color="default" onClick={handleConsultar}>
                    Consultar
                </Button>
            </div>

            {/* Status cards */}
            <div className={styles.cardsGrid}>
                <StatusCard label="Verde" value={stats.verde} variant="green" />
                <StatusCard label="Amarillo" value={stats.amarillo} variant="yellow" />
                <StatusCard label="Rojo" value={stats.rojo} variant="red" />
            </div>

            <div className={styles.chartContainer}>
                <Text className={styles.chartTitle}>Cantidad de reportes</Text>
                <BarChart
                    data={chartData}
                    colorScheme="single"
                    height={400}
                    width="100%"
                    showFullGrid
                />
            </div>

            {/* Projects table */}
            <div className={styles.tableContainer}>
                <Text className={styles.chartTitle}>Resumen por proyecto</Text>
                <TableRow
                    isHeader
                    gridTemplate={GRID}
                    cells={headers}
                />
                {DUMMY_DATA.map((row, i) => (
                    <TableRow
                        key={i}
                        gridTemplate={GRID}
                        scale={0.8}
                        cells={[
                            { content: <Text variant="muted">{row.colaborador}</Text> },
                            { content: <Text variant="muted">{row.proyecto}</Text> },
                            { content: <Text variant="muted">{row.fechaInicio}</Text> },
                            { content: <Text variant="muted">{row.fechaFin}</Text> },
                            { content: <Text variant="muted">{row.avancePlan}</Text> },
                            { content: <Text variant="muted">{row.avanceReal}</Text> },
                            { content: <Text variant="muted">{row.desvAvance}</Text> },
                            { content: <Text variant="muted">{row.cumplTareas}</Text> },
                            { content: <Text variant="muted">{row.cumplFechas}</Text> },
                            { content: <Text variant="muted">{row.desvHoras}</Text> },
                            { content: <Text variant="muted">{row.prod}</Text> },
                            { content: <Text variant="muted">{row.bloqueos}</Text> },
                            {
                                content: <StatusChip variant={row.estado} />,
                                align: "center",
                            },
                            { content: <Text variant="muted">{row.situacion}</Text> },
                        ] as TableCellConfig[]}
                    />
                ))}
            </div>

        </div>
    );
};

export default DashboardProjects;