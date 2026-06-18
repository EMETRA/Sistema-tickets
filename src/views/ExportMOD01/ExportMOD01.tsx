"use client";

import React, { useState } from "react";
import { Title } from "@/components/client/atoms/Title";
import { Input } from "@/components/client/atoms/Input";
import { FormField } from "@/components/client/molecules/FormField";
import { Button } from "@/components/client/atoms/Button";
import styles from "./ExportMOD01.module.scss";

const ExportMOD01: React.FC = () => {
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const handleExport = () => {
        // TODO: call API or generate CSV with date range
        console.log({ fechaInicio, fechaFin });
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.card}>
                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Rango de fechas para exportar
                    </Title>
                    <div className={styles.fieldsGridTwo}>
                        <FormField label="Fecha inicio" htmlFor="fecha-inicio">
                            <Input
                                id="fecha-inicio"
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </FormField>
                        <FormField label="Fecha fin" htmlFor="fecha-fin">
                            <Input
                                id="fecha-fin"
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </FormField>
                    </div>
                    <div className={styles.formActions}>
                        <Button variant="contained" color="success" onClick={handleExport}>
                            Exportar
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ExportMOD01;