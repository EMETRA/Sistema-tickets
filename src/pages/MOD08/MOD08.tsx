"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Input } from "../../components/client/atoms/Input";
import { Button } from '../../components/client/atoms/Button';
import { Select } from '../../components/client/atoms/Select';
import { Text } from '../../components/client/atoms/Text';

import { SuccessModal } from '../../components/client/organisms/SucessModal';

import styles from './MOD08.module.scss';

const reportTypes = [
    { label: "Tipo 1", value: 1 },
    { label: "Tipo 2", value: 2 },
    { label: "Tipo 3", value: 3 },
];

const MOD08: React.FC = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedReportType, setSelectedReportType] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleExecute = () => {
        if (startDate === '' || endDate === '' || selectedReportType === '') {
            alert('Por favor, complete todos los campos antes de ejecutar el proceso.');
            return;
        }
        
        alert(`Ejecutando proceso con:\nFecha Inicio: ${startDate}\nFecha Fin: ${endDate}\nTipo de Reporte: ${selectedReportType}`);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Title variant="mid" tag="h3" className={styles.title}>Exportar Reporte</Title>

                {/* Fecha de inicio */}
                <FormField label="Fecha de inicio" htmlFor="startDate" required className={styles.fieldStartDate}>
                    <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Ingresa la fecha de inicio"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                {/* Fecha de fin */}
                <FormField label="Fecha de fin" htmlFor="endDate" required className={styles.fieldEndDate}>
                    <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Ingresa la fecha de fin"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                <FormField label="Tipo de Reporte" htmlFor="reportType" required className={styles.fieldReportType}>
                    <Select
                        id="reportType"
                        value={selectedReportType}
                        onChange={(e) => {
                            setSelectedReportType(e.target.value);
                        }}
                        options={reportTypes}
                        placeholder="Seleccionar tipo de reporte"
                    />
                </FormField>

                <Button
                    variant="contained"
                    color="default"
                    onClick={handleExecute}
                    className={styles.executeButton}
                >
                    Generar Reporte en Excel
                </Button>

                <Text variant="caption" className={styles.footerText}>
                    Dirección de Informática · Municipalidad de Guatemala
                </Text>
            </div>
            <SuccessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Excel generado correctamente"
            />
        </div>
    )
}

export default MOD08;
