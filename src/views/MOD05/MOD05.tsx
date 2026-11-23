"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Checkbox } from '../../components/client/atoms/Checkbox';
import { Input } from "../../components/client/atoms/Input";
import { Select } from '../../components/client/atoms/Select';
import { Button } from '../../components/client/atoms/Button';
import { Text } from '../../components/client/atoms/Text';

import { PopUp } from '@/components/client/molecules/PopUp';

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

    const [validation, setValidation] = useState('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Hooks para obtener datos del servidor
    const {
        data: estatusOpciones,
        loading: loadingEstatus,
        error: errorEstatus,
        refetch: refetchEstatus,
    } = useGetReporteRhEstatusOpciones();

    const {
        data: camposDisponibles,
        loading: loadingCampos,
        error: errorCampos,
        refetch: refetchCampos,
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
        if (exportLoading) return;
        setValidation('');
        if (!status) {
            setValidation('Por favor, selecciona un estatus antes de ejecutar el proceso.');
            return;
        }

        if (Boolean(startDate) !== Boolean(endDate)) {
            setValidation('Por favor, completa ambas fechas antes de ejecutar el proceso.');
            return;
        }

        if (selectedFields.size === 0) {
            setValidation('Por favor, selecciona al menos un campo para mostrar.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setValidation('La fecha de inicio no puede ser posterior a la fecha de fin.');
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
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>

                <Title variant="mid" tag="h3" className={styles.title}>Filtros del reporte</Title>
                {validation && <p role="alert">{validation}</p>}
                {(errorEstatus || errorCampos) && <p role="alert">No se pudieron cargar los catálogos. <button onClick={() => void Promise.all([refetchEstatus(), refetchCampos()])}>Reintentar catálogos</button></p>}
                <div className={styles.completedTasksFilters}>

                    {/* Estatus */}
                    <FormField label="Estatus" htmlFor="status" required className={styles.fieldStatus}>
                        {errorEstatus && (
                            <Text variant="caption" className={styles.errorText}>
                                No se pudo cargar el catálogo de estatus.
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
                    <FormField label="Fecha ingreso desde (opcional)" htmlFor="startDate" className={styles.fieldStartDate}>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Ingresa la fecha de inicio"
                        />
                    </FormField>

                    {/* Fecha ingreso hasta */}
                    <FormField label="Fecha ingreso hasta (opcional)" htmlFor="endDate" className={styles.fieldEndDate}>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Ingresa la fecha de fin"
                        />
                    </FormField>
                </div>

                <Title variant="mid" tag="h3" className={styles.title}>Seleccione los campos a mostrar</Title>
                {errorCampos && (
                    <Text variant="caption" className={styles.errorText}>
                        No se pudo cargar el catálogo de campos.
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
                    state={exportLoading ? "loading" : "default"}
                >
                    {exportLoading ? 'Generando Excel...' : 'Generar Excel'}
                </Button>

                {exportError && (
                    <Text variant="caption" className={styles.errorText}>
                        {exportError.message}
                    </Text>
                )}
            </div>
            <PopUp
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                title="Excel generado correctamente"
                description="El excel ha sido generado correctamente"
                variant="success"
            />
        </div>
    );
};

export default MOD05;
