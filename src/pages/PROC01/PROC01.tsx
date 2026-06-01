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

const PROCESS_CONFIG: Record<string, ProcessConfig> = {
    semaforos: { label: 'Semáforos', requiresUser: true, requiresCorrelative: true },
    kapsch: { label: 'Kapsch', requiresUser: false, requiresCorrelative: false },
    via: { label: 'Via', requiresUser: true, requiresCorrelative: false },
    neural: { label: 'Neural', requiresUser: false, requiresCorrelative: false },
    notificaciones: { label: 'Notificaciones', requiresUser: true, requiresCorrelative: true },
};

const PROC01: React.FC = () => {
    const [selectedProcess, setSelectedProcess] = useState<string>('');
    const [usuario, setUsuario] = useState<string>('');
    const [correlativo, setCorrelativo] = useState<string>('');

    const currentProcess = selectedProcess ? PROCESS_CONFIG[selectedProcess] : null;

    const handleExecute = () => {
        if (currentProcess) {
            if (currentProcess.requiresUser && !usuario) {
                alert('Por favor, ingrese el usuario requerido para este proceso.');
                return;
            }
            if (currentProcess.requiresCorrelative && !correlativo) {
                alert('Por favor, ingrese el correlativo requerido para este proceso.');
                return;
            }
        }
        

        console.log({
            proceso: selectedProcess,
            usuario,
            correlativo,
        });
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
                >
                    Ejecutar proceso
                </Button>
            </div>
            <div className={styles.cardsContainer}>
                <Card
                    title="Total Procesados"
                    value="150"
                    variant="info"
                />
                <Card
                    title="Total Actualizados"
                    value="15"
                    variant="info"
                />
                <Card
                    title="Total Fallidos"
                    value="0"
                    variant="info"
                />
            </div>
        </div>
    )
}

export default PROC01;
