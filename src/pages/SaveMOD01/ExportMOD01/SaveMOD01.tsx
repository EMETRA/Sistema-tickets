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

const GRID = "minmax(0, 1fr) minmax(0, 2fr)";

// TODO: replace with real data from mutation response
const DUMMY_REPORT = {
    id: 704,
    proyecto: "Migración de procesos",
    cargo: "Programador",
    avanceGeneral: "35.00%",
    indicadorProductividad: "100.00%",
    estado: "verde" as const,
    situacion: "El proyecto presenta avance conforme a lo planificado, cumplimiento adecuado de tareas y fechas, sin bloqueos críticos reportados.",
};

const SaveMOD01: React.FC = () => {
    const router = useRouter();

    const rows: { label: string; content: React.ReactNode }[] = [
        { label: "ID Reporte", content: <Text variant="muted">{DUMMY_REPORT.id}</Text> },
        { label: "Proyecto", content: <Text variant="muted">{DUMMY_REPORT.proyecto}</Text> },
        { label: "Cargo", content: <Text variant="muted">{DUMMY_REPORT.cargo}</Text> },
        { label: "Porcentaje de avance general", content: <Text variant="muted">{DUMMY_REPORT.avanceGeneral}</Text> },
        { label: "Índice de productividad", content: <Text variant="muted">{DUMMY_REPORT.indicadorProductividad}</Text> },
        { label: "Estado del proyecto", content: <StatusChip variant={DUMMY_REPORT.estado} /> },
        { label: "Situación actual", content: <Text variant="muted">{DUMMY_REPORT.situacion}</Text> },
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
                    <Button variant="contained" color="default" onClick={() => router.push("/home/mod01")}>
                        Nuevo reporte
                    </Button>
                    <Button variant="contained" color="default" onClick={() => router.push("/home/dashboard-proyectos")}>
                        Ver dashboard proyectos
                    </Button>
                    <Button variant="contained" color="default" onClick={() => router.push("/home/dashboard-colaboradores")}>
                        Ver dashboard colaboradores
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SaveMOD01;