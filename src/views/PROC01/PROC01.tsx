"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Input } from '../../components/client/atoms/Input';
import { Button } from '../../components/client/atoms/Button';
import { Card } from '../../components/client/atoms/Card';
import { Select } from '../../components/client/atoms/Select';

import styles from './PROC01.module.scss';
import type { ProcessConfig } from './types';
import { useExecuteLprRemission } from '@/api/hooks';

const PROCESS_CONFIG: Record<string, ProcessConfig> = {
    semaforos: { label: 'Semáforos', requiresUser: true, requiresCorrelative: true },
    kapsch: { label: 'Kapsch', requiresUser: false, requiresCorrelative: false },
    via: { label: 'Via', requiresUser: true, requiresCorrelative: false },
    neural: { label: 'Neural', requiresUser: false, requiresCorrelative: false },
    notificaciones: { label: 'Notificaciones', requiresUser: true, requiresCorrelative: true },
};

const PROC01: React.FC = () => {
    const { executeLprRemission, loading} = useExecuteLprRemission();

    const [processResult, setProcessResult] = useState({
        totalProcesados: "—",
        totalActualizados: "—",
        totalFallidos: "—",
    });

    const [selectedProcess, setSelectedProcess] = useState<string>('');
    const [usuario, setUsuario] = useState<string>('');
    const [correlativo, setCorrelativo] = useState<string>('');

    const currentProcess = selectedProcess ? PROCESS_CONFIG[selectedProcess] : null;

    const handleExecute = async () => {
        if (!selectedProcess) return;

        if (currentProcess?.requiresUser && !usuario) {
            alert('Por favor, ingrese el usuario requerido para este proceso.');
            return;
        }
        if (currentProcess?.requiresCorrelative && !correlativo) {
            alert('Por favor, ingrese el correlativo requerido para este proceso.');
            return;
        }

        try {
            const result = await executeLprRemission({
                origen: selectedProcess.toUpperCase(),
                ...(usuario && { usuario }),
                ...(correlativo && { correlativo }),
            });

            setProcessResult({
                totalProcesados: result.totalProcesados.toString(),
                totalActualizados: result.totalActualizados.toString(),
                totalFallidos: result.totalFallidos.toString(),
            });
        } catch (err) {
            console.error("Error executing process:", err);
        }
    };
    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Title variant="mid" tag="h3" className={styles.title}>Escoger Proceso</Title>
                
                <FormField label="Proceso" htmlFor="proceso" required>
                    <Select
                        id="proceso"
                        value={selectedProcess}
                        onChange={(e) => {
                            setSelectedProcess(e.target.value);
                            setUsuario('');
                            setCorrelativo('');
                        }}
                        options={Object.entries(PROCESS_CONFIG).map(([key, config]) => ({
                            label: config.label,
                            value: key,
                        }))}
                        placeholder="Seleccionar proceso"
                    />
                </FormField>

                {currentProcess?.requiresUser && (
                    <FormField label="Usuario" htmlFor="usuario">
                        <Input
                            id="usuario"
                            type="text"
                            placeholder="Ingrese el usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                    </FormField>
                )}

                {currentProcess?.requiresCorrelative && (
                    <FormField label="Correlativo" htmlFor="correlativo">
                        <Input
                            id="correlativo"
                            type="text"
                            placeholder="Ingrese el correlativo"
                            value={correlativo}
                            onChange={(e) => setCorrelativo(e.target.value)}
                        />
                    </FormField>
                )}

                <Button
                    variant="contained"
                    color="default"
                    onClick={handleExecute}
                    className={styles.executeButton}
                    state={loading ? "loading" : "default"}
                    loadingText="Ejecutando..."
                >
                    Ejecutar proceso
                </Button>
            </div>
            <div className={styles.cardsContainer}>
                <Card
                    title="Total Procesados"
                    value={loading ? "..." : processResult.totalProcesados}
                    variant="info"
                    className={loading ? styles.cardLoading : ""}
                />
                <Card
                    title="Total Actualizados"
                    value={loading ? "..." : processResult.totalActualizados}
                    variant="info"
                    className={loading ? styles.cardLoading : ""}
                />
                <Card
                    title="Total Fallidos"
                    value={loading ? "..." : processResult.totalFallidos}
                    variant="info"
                    className={loading ? styles.cardLoading : ""}
                />
            </div>
        </div>
    )
}

export default PROC01;
