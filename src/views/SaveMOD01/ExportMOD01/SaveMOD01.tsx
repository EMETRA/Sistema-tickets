"use client";

import React from "react";
import { Title } from "@/components/client/atoms/Title";
import { Button } from "@/components/client/atoms/Button";
import { Text } from "@/components/client/atoms/Text";
import { TableRow } from "@/components/client/molecules/TableRow";
import StatusChip from "@/components/client/atoms/StatusChip";
import type { TableCellConfig } from "@/components/client/molecules/TableRow/types";
import { useRouter } from "next/navigation";
import styles from "./SaveMOD01.module.scss";
import { useReporteSemanalStore } from "@/store/useSaveWeeklyReportStore";

const GRID = "minmax(0, 1fr) minmax(0, 2fr)";

const SaveMOD01: React.FC = () => {
    const router = useRouter();

    const { lastResult, lastInput } = useReporteSemanalStore();

    if (!lastResult?.success || !lastInput) return <div className={styles.card}><h2>No hay un reporte guardado en esta sesión</h2><p>Registra un reporte o consulta los existentes para ver su resultado.</p><Button onClick={() => router.push("/home/informatica/reportes/mod01")}>Nuevo reporte</Button><Button variant="outlined" onClick={() => router.push("/home/informatica/reportes/exportmod01")}>Consultar reportes</Button></div>;
    const state = lastResult.reporte.estadoProyecto?.toLowerCase();

    const rows: { label: string; content: React.ReactNode }[] = [
        {
            label: "ID Reporte",
            content: <Text variant="muted">{lastResult?.idReporte ?? "—"}</Text>
        },
        {
            label: "Proyecto",
            content: <Text variant="muted">{lastInput?.proyecto ?? "—"}</Text>
        },
        {
            label: "Cargo",
            content: <Text variant="muted">{lastInput?.cargo ?? "—"}</Text>
        },
        {
            label: "Porcentaje de avance general",
            content: <Text variant="muted">{lastInput?.avanceReal != null ? `${lastInput.avanceReal.toFixed(2)}%` : "—"}</Text>
        },
        {
            label: "Índice de productividad",
            content: <Text variant="muted">{lastResult?.reporte.indProductividad != null ? `${lastResult.reporte.indProductividad.toFixed(2)}%` : "—"}</Text>
        },
        {
            label: "Estado del proyecto",
            content: state === "verde" || state === "amarillo" || state === "rojo" ? <StatusChip variant={state} /> : <Text>{lastResult.reporte.estadoProyecto || "Sin estado informado"}</Text> },
        {
            label: "Observaciones",
            content: <Text variant="muted">{lastInput.observaciones || "Sin observaciones"}</Text>
        },
    ];

    return (
        <div className={styles.mainContainer}>
            <div className={styles.card}>
                <Title variant="mid" tag="h2" className={styles.title}>
                    Reporte guardado correctamente
                </Title>

                <div className={styles.tableContainer}>
                    {rows.map((row, i) => (
                        <TableRow
                            key={i}
                            gridTemplate={GRID}
                            scale={0.9}
                            cells={[
                                { content: <Text className={styles.rowLabel}>{row.label}</Text> },
                                { content: row.content },
                            ] as TableCellConfig[]}
                        />
                    ))}
                </div>

                <div className={styles.formActions}>
                    <Button variant="contained" color="default" onClick={() => router.push("/home/informatica/reportes/mod01")}>
                        Nuevo reporte
                    </Button>
                    <Button variant="contained" color="default" onClick={() => router.push("/home/informatica/reportes/dashboard-proyectos")}>
                        Ver dashboard proyectos
                    </Button>
                    <Button variant="contained" color="default" onClick={() => router.push("/home/informatica/reportes/dashboard-colaboradores")}>
                        Ver dashboard colaboradores
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SaveMOD01;