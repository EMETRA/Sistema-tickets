"use client";

import React, { useState } from "react";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import { Text } from "@/components/client/atoms/Text";
import { BarChart } from "@/components/client/atoms/BarChart";
import { TableRow } from "@/components/client/molecules/TableRow";
import StatusCard from "@/components/client/molecules/StatusCard";
import type { TableCellConfig } from "@/components/client/molecules/TableRow/types";
import styles from "./DashboardCollaborators.module.scss";

interface CollaboratorRow {
    colaborador: string;
    reportes: number;
    proyectos: number;
    avancePlan: string;
    avanceReal: string;
    desvAvance: string;
    cumplTareas: string;
    cumplFechas: string;
    desvHoras: string;
    productividad: number;
    bloqueos: number;
    ultimoReporte: string;
}

const GRID = "minmax(0,1.2fr) minmax(0,0.6fr) minmax(0,0.7fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,0.9fr) minmax(0,0.8fr) minmax(0,0.6fr) minmax(0,0.9fr)";

const DUMMY_DATA: CollaboratorRow[] = [
    { colaborador: "Daniel Morales", reportes: 16, proyectos: 6, avancePlan: "24.06%", avanceReal: "23.69%", desvAvance: "-0.38%", cumplTareas: "85.42%", cumplFechas: "87.50%", desvHoras: "-1.06%", productividad: 87.92, bloqueos: 1, ultimoReporte: "22/05/2026" },
    { colaborador: "Diego Hernandez", reportes: 17, proyectos: 4, avancePlan: "76.47%", avanceReal: "76.47%", desvAvance: "0.00%", cumplTareas: "76.47%", cumplFechas: "76.47%", desvHoras: "-3.53%", productividad: 75.41, bloqueos: 1, ultimoReporte: "22/05/2026" },
    { colaborador: "Elias Alvarado", reportes: 11, proyectos: 4, avancePlan: "90.91%", avanceReal: "90.91%", desvAvance: "0.00%", cumplTareas: "90.91%", cumplFechas: "100.00%", desvHoras: "-14.52%", productividad: 87.92, bloqueos: 1, ultimoReporte: "22/05/2026" },
    { colaborador: "Erick Guerra", reportes: 4, proyectos: 2, avancePlan: "35.50%", avanceReal: "35.50%", desvAvance: "0.00%", cumplTareas: "83.33%", cumplFechas: "50.00%", desvHoras: "-3.13%", productividad: 77.40, bloqueos: 3, ultimoReporte: "23/05/2026" },
    { colaborador: "Feyser Caceres", reportes: 11, proyectos: 6, avancePlan: "57.73%", avanceReal: "57.73%", desvAvance: "0.00%", cumplTareas: "100.00%", cumplFechas: "100.00%", desvHoras: "0.00%", productividad: 100.00, bloqueos: 0, ultimoReporte: "24/04/2026" },
    { colaborador: "Fredy Padilla", reportes: 7, proyectos: 7, avancePlan: "72.86%", avanceReal: "84.29%", desvAvance: "11.43%", cumplTareas: "200.00%", cumplFechas: "85.71%", desvHoras: "2.04%", productividad: 130.82, bloqueos: 0, ultimoReporte: "22/05/2026" },
    { colaborador: "Gerbert Martinez", reportes: 6, proyectos: 3, avancePlan: "5.00%", avanceReal: "5.00%", desvAvance: "0.00%", cumplTareas: "84.17%", cumplFechas: "100.00%", desvHoras: "2.86%", productividad: 92.81, bloqueos: 0, ultimoReporte: "24/04/2026" },
    { colaborador: "Jenniffer Toxcon", reportes: 8, proyectos: 2, avancePlan: "73.13%", avanceReal: "62.50%", desvAvance: "-10.63%", cumplTareas: "121.88%", cumplFechas: "75.00%", desvHoras: "0.53%", productividad: 93.84, bloqueos: 3, ultimoReporte: "22/05/2026" },
    { colaborador: "Roger Herrera", reportes: 11, proyectos: 1, avancePlan: "70.91%", avanceReal: "71.36%", desvAvance: "0.45%", cumplTareas: "72.73%", cumplFechas: "45.45%", desvHoras: "-1.52%", productividad: 69.55, bloqueos: 0, ultimoReporte: "22/05/2026" },
    { colaborador: "Rudy Juarez", reportes: 9, proyectos: 5, avancePlan: "19.22%", avanceReal: "19.22%", desvAvance: "0.00%", cumplTareas: "97.78%", cumplFechas: "100.00%", desvHoras: "1.39%", productividad: 98.69, bloqueos: 4, ultimoReporte: "13/12/2026" },
];

const headers: TableCellConfig[] = [
    { label: "Colaborador" },
    { label: "Reportes" },
    { label: "Proyectos" },
    { label: "Avance Plan %" },
    { label: "Avance Real %" },
    { label: "Desv. Avance %" },
    { label: "% Cumpl. Tareas" },
    { label: "% Cumpl. Fechas" },
    { label: "% Desv. Horas" },
    { label: "Productividad" },
    { label: "Bloqueos" },
    { label: "Último reporte" },
];

const DashboardCollaborators: React.FC = () => {
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    // TODO: replace with real query
    const stats = {
        colaboradoresConReportes: 13,
        totalReportes: 112,
        bloqueosAcumulados: 14,
    };

    const avanceData = DUMMY_DATA.map(c => ({
        label: c.colaborador.split(" ")[0],
        value: parseFloat(c.avanceReal),
        color: "#1700A5",
    }));

    const productividadData = DUMMY_DATA.map(c => ({
        label: c.colaborador.split(" ")[0],
        value: c.productividad,
        color: "#3B6D11",
    }));

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
                    <Input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                </div>
                <div className={styles.filterField}>
                    <Text className={styles.filterLabel}>Hasta:</Text>
                    <Input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                </div>
                <Button variant="contained" color="default" onClick={handleConsultar}>
                    Consultar
                </Button>
            </div>

            {/* Stats cards */}
            <div className={styles.cardsGrid}>
                <StatusCard label="Colaboradores con reportes" value={stats.colaboradoresConReportes} variant="blue" />
                <StatusCard label="Total reportes" value={stats.totalReportes} variant="green" />
                <StatusCard label="Bloqueos acumulados" value={stats.bloqueosAcumulados} variant="yellow" />
            </div>

            {/* Avance real chart */}
            <div className={styles.chartContainer}>
                <Text className={styles.chartTitle}>Avance real promedio por colaborador</Text>
                <BarChart data={avanceData} colorScheme="single" height={400} width="100%" showFullGrid />
            </div>

            {/* Productividad chart */}
            <div className={styles.chartContainer}>
                <Text className={styles.chartTitle}>Productividad promedio por colaborador</Text>
                <BarChart data={productividadData} colorScheme="single" height={400} width="100%" showFullGrid />
            </div>

            {/* Collaborators table */}
            <div className={styles.tableContainer}>
                <Text className={styles.chartTitle}>Resumen por colaborador</Text>
                <TableRow isHeader gridTemplate={GRID} cells={headers} />
                {DUMMY_DATA.map((row, i) => (
                    <TableRow
                        key={i}
                        gridTemplate={GRID}
                        scale={0.8}
                        cells={[
                            { content: <Text variant="muted">{row.colaborador}</Text> },
                            { content: <Text variant="muted">{row.reportes}</Text> },
                            { content: <Text variant="muted">{row.proyectos}</Text> },
                            { content: <Text variant="muted">{row.avancePlan}</Text> },
                            { content: <Text variant="muted">{row.avanceReal}</Text> },
                            { content: <Text variant="muted">{row.desvAvance}</Text> },
                            { content: <Text variant="muted">{row.cumplTareas}</Text> },
                            { content: <Text variant="muted">{row.cumplFechas}</Text> },
                            { content: <Text variant="muted">{row.desvHoras}</Text> },
                            { content: <Text variant="muted">{row.productividad}</Text> },
                            { content: <Text variant="muted">{row.bloqueos}</Text> },
                            { content: <Text variant="muted">{row.ultimoReporte}</Text> },
                        ] as TableCellConfig[]}
                    />
                ))}
                <div className={styles.tableFooter}>
                    <Text variant="muted" className={styles.tableFooterText}>
                        El dashboard incluye a todos los colaboradores. Los que no tienen reportes en el rango aparecen con valores en cero.
                    </Text>
                </div>
            </div>

        </div>
    );
};

export default DashboardCollaborators;