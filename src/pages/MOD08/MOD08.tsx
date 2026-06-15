"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Input } from "../../components/client/atoms/Input";
import { Button } from '../../components/client/atoms/Button';
import { Select } from '../../components/client/atoms/Select';
import { Text } from '../../components/client/atoms/Text';

import { SuccessModal } from '../../components/client/organisms/SucessModal';
import { useGetReporteAnuladosExcel } from '@/api/hooks/useGetReporteAnuladosExcel';

import styles from './MOD08.module.scss';

import type { TipoReporteAnulado } from '@/api/graphql/MOD08';

const reportTypes = [
    { label: "Recibos de Pago", value: 'RECIBOS_PAGO' },
    { label: "Ticket Parqueos", value: 'TICKET_PARQUEOS' },
    { label: "Paralelo Formas", value: 'PARALELO_FORMAS' },
];

const MOD08: React.FC = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedReportType, setSelectedReportType] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { exportar, loading, error } = useGetReporteAnuladosExcel();

    const handleExecute = async () => {
        if (startDate === '' || endDate === '' || selectedReportType === '') {
            alert('Por favor, complete todos los campos antes de ejecutar el proceso.');
            return;
        }

        const success = await exportar({
            fechaInicio: startDate,
            fechaFin: endDate,
            tipoReporte: selectedReportType as TipoReporteAnulado,
        });

        if (success) {
            setIsModalOpen(true);
        }
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
                        onChange={(e) => setSelectedReportType(e.target.value)}
                        options={reportTypes}
                        placeholder="Seleccionar tipo de reporte"
                    />
                </FormField>

                <Button
                    variant="contained"
                    color="default"
                    onClick={handleExecute}
                    className={styles.executeButton}
                    state={loading ? "loading" : "default"}
                >
                    {loading ? 'Generando...' : 'Generar Reporte en Excel'}
                </Button>

                {error && (
                    <Text variant="caption" className={styles.errorText}>
                        {error.message}
                    </Text>
                )}

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
