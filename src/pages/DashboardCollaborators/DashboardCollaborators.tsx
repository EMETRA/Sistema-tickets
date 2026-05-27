"use client";

import React from "react";
import { Title } from "@/components/client/atoms/Title";
import { Input } from "@/components/client/atoms/Input";
import { FormField } from "@/components/client/molecules/FormField";
import styles from "./DashboardCollaborators.module.scss";


const DashboardCollaborators: React.FC = () => {

    const handleField = (field: string, value: string) => {
        console.log(`Campo ${field} actualizado con valor: ${value}`);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.card}>
                {/* Grupo 1 */}
                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Información general
                    </Title>
                    <div className={styles.fieldsGrid}>
                        <FormField label="Cargo" htmlFor="cargo">
                            <Input id="cargo" type="text" placeholder="Ingrese cargo" onChange={(e) => handleField("cargo", e.target.value)} />
                        </FormField>
                        <FormField label="Proyecto asignado" htmlFor="proyecto">
                            <Input id="proyecto" type="text" placeholder="Ingrese proyecto" onChange={(e) => handleField("proyecto", e.target.value)} />
                        </FormField>
                        <FormField label="Fecha inicio" htmlFor="fecha-inicio">
                            <Input id="fecha-inicio" type="date" state="default"  placeholder="Selecciona una fecha..." onChange={(e) => handleField("fechaInicio", e.target.value)}     />
                        </FormField>

                        <FormField label="Fecha fin" htmlFor="fecha-fin">
                            <Input id="fecha-fin" type="date" placeholder="Selecciona una fecha..." onChange={(e) => handleField("fechaFin", e.target.value)} />
                        </FormField>
                        <FormField label="Jefe inmediato" htmlFor="jefe">
                            <Input id="jefe" type="text" placeholder="Ingrese jefe inmediato" onChange={(e) => handleField("jefe", e.target.value)} />
                        </FormField>
                        <FormField label="% Avance general" htmlFor="avance">
                            <Input id="avance" type="number" min={0} max={100} placeholder="Ingrese avance" onChange={(e) => handleField("avance", e.target.value)} />
                        </FormField>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default DashboardCollaborators;