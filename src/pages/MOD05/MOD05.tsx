"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Checkbox } from '../../components/client/atoms/Checkbox';
import { Input } from "../../components/client/atoms/Input";
import { Select } from '../../components/client/atoms/Select';
import { Button } from '../../components/client/atoms/Button';
import { Text } from '../../components/client/atoms/Text';

import { SuccessModal } from '../../components/client/organisms/SucessModal';

import styles from './MOD05.module.scss';

import {
    useGetReporteRhEstatusOpciones,
    useGetReporteRhCamposDisponibles,
    useGetReporteRhExportExcel,
} from '@/api/hooks';

const MOD05: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Hooks para obtener datos del servidor
    const {
        data: estatusOpciones,
        loading: loadingEstatus,
        error: errorEstatus,
    } = useGetReporteRhEstatusOpciones();

    const {
        data: camposDisponibles,
        loading: loadingCampos,
        error: errorCampos,
    } = useGetReporteRhCamposDisponibles();

    const {
        loading: exportLoading,
        error: exportError,
        exportar,
    } = useGetReporteRhExportExcel();

    const handleFieldToggle = (value: string) => {
        setSelectedFields(prevState => {
            const newSet = new Set(prevState);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return newSet;
        });
    };

    const handleExecute = async () => {
        if (!status) {
            alert('Por favor, selecciona un estatus antes de ejecutar el proceso.');
            return;
        }

        if (!startDate || !endDate) {
            alert('Por favor, completa ambas fechas antes de ejecutar el proceso.');
            return;
        }

        if (selectedFields.size === 0) {
            alert('Por favor, selecciona al menos un campo para mostrar.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
            return;
        }

        const selectedFieldsArray = Array.from(selectedFields);

        const result = await exportar({
            estatus: status,
            fechaIngresoDesde: startDate,
            fechaIngresoHasta: endDate,
            campos: selectedFieldsArray,
        });

        if (result) {
            setIsModalOpen(true);
        } else {
            alert('Error al generar el reporte. Por favor, intenta nuevamente.');
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>

                <Title variant="mid" tag="h3" className={styles.title}>Tareas completadas</Title>
                <div className={styles.completedTasksFilters}>

                    {/* Estatus */}
                    <FormField label="Estatus" htmlFor="status" required className={styles.fieldStatus}>
                        {errorEstatus && (
                            <Text variant="caption" className={styles.errorText}>
                                {errorEstatus.message}
                            </Text>
                        )}
                        <Select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            options={estatusOpciones.map((opt) => ({
                                label: opt.etiqueta,
                                value: opt.codigo,
                            }))}
                            placeholder="Selecciona un estatus"
                            disabled={loadingEstatus}
                            required
                        />
                    </FormField>

                    {/* Fecha ingreso desde */}
                    <FormField label="Fecha ingreso desde" htmlFor="startDate" required className={styles.fieldStartDate}>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Ingresa la fecha de inicio"
                            required
                        />
                    </FormField>

                    {/* Fecha ingreso hasta */}
                    <FormField label="Fecha ingreso hasta" htmlFor="endDate" required className={styles.fieldEndDate}>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Ingresa la fecha de fin"
                            required
                        />
                    </FormField>
                </div>

                <Title variant="mid" tag="h3" className={styles.title}>Seleccione los campos a mostrar</Title>
                {errorCampos && (
                    <Text variant="caption" className={styles.errorText}>
                        {errorCampos.message}
                    </Text>
                )}
                {loadingCampos && <Text>Cargando campos disponibles...</Text>}
                <div className={styles.fieldsSelection}>
                    {camposDisponibles.map((campo) => (
                        <Checkbox
                            key={campo.codigo}
                            id={campo.codigo}
                            label={campo.etiqueta}
                            checked={selectedFields.has(campo.codigo)}
                            onChange={() => handleFieldToggle(campo.codigo)}
                        />
                    ))}
                </div>

                <Button
                    variant="contained"
                    color="success"
                    onClick={handleExecute}
                    className={styles.executeButton}
                >
                    {exportLoading ? 'Generando Excel...' : 'Generar Excel'}
                </Button>

                {exportError && (
                    <Text variant="caption" className={styles.errorText}>
                        Error: {exportError.message}
                    </Text>
                )}
            </div>
            <SuccessModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
};

export default MOD05;
