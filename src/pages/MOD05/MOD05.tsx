"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Checkbox } from '../../components/client/atoms/Checkbox';
import { Input } from "../../components/client/atoms/Input";
import { Select } from '../../components/client/atoms/Select';
import { Button } from '../../components/client/atoms/Button';

import { SuccessModal } from '../../components/client/organisms/SucessModal';

import styles from './MOD05.module.scss';

const reportStatus = [
    { label: "Archivo", value: "archivo" },
    { label: "Baja", value: "baja" },
    { label: "Suspendido", value: "suspendido" },
];

const availableFields = [
    { label: "Empleado", value: "empleado" },
    { label: "Primer nombre", value: "primer_nombre" },
    { label: "Segundo nombre", value: "segundo_nombre" },
    { label: "Tercer nombre", value: "tercer_nombre" },
    { label: "Primer apellido", value: "primer_apellido" },
    { label: "Segundo apellido", value: "segundo_apellido" },
    { label: "Sueldo personal", value: "sueldo_personal" },
    { label: "Sueldo puesto", value: "sueldo_puesto" },
    { label: "Sueldo total", value: "sueldo_total" },
    { label: "Reglón", value: "reglon" },
    { label: "Fuente", value: "fuente" },
    { label: "Puesto", value: "puesto" },
    { label: "Centro costo", value: "centro_costo" },
    { label: "NIT", value: "nit" },
    { label: "Cédula", value: "cedula" },
    { label: "DPI", value: "dpi" },
    { label: "Dirección", value: "direccion" },
    { label: "Teléfono", value: "telefono" },
    { label: "Sexo", value: "sexo" },
    { label: "Partida Presup.", value: "partida_presup" },
    { label: "Edad", value: "edad" },
    { label: "Fecha ingreso", value: "fecha_ingreso" },
    { label: "Tipo sangre", value: "tipo_sangre" },
    { label: "IGSS", value: "igss" },
    { label: "Estatus", value: "estatus" },
    { label: "Agente", value: "agente" },
    { label: "Unidad", value: "unidad" },
    { label: "Fecha nacimiento", value: "fecha_nacimiento" },
    { label: "P. funcional", value: "p_funcional" },
    { label: "Estado civil", value: "estado_civil" },
    { label: "Correo", value: "correo" },
];

const MOD05: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

    const handleExecute = () => {
        if (status === '' || startDate === '' || endDate === '') {
            alert('Por favor, complete todos los campos antes de ejecutar el proceso.');
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
        alert(`Ejecutando proceso con:\nEstado: ${status}\nFecha de inicio: ${startDate}\nFecha de fin: ${endDate}\nCampos seleccionados: ${selectedFieldsArray.join(', ')}`);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>

                <Title variant="mid" tag="h3" className={styles.title}>Tareas completadas</Title>
                <div className={styles.completedTasksFilters}>

                    {/* Estatus */}
                    <FormField label="Estatus" htmlFor="status" required className={styles.fieldStatus}>
                        <Select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            options={reportStatus}
                            placeholder="Selecciona un área"
                            // state={loading ? "disabled" : "default"}
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
                            // state={loading ? "disabled" : "default"}
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
                            // state={loading ? "disabled" : "default"}
                            required
                        />
                    </FormField>
                </div>

                <Title variant="mid" tag="h3" className={styles.title}>Seleccione los campos a mostrar</Title>
                <div className={styles.fieldsSelection}>
                    {availableFields.map((field) => (
                        <Checkbox
                            key={field.value}
                            id={field.value}
                            label={field.label}
                            checked={selectedFields.has(field.value)}
                            onChange={() => handleFieldToggle(field.value)}
                        />
                    ))}
                </div>

                <Button
                    variant="contained"
                    color="success"
                    onClick={handleExecute}
                    className={styles.executeButton}
                >
                    Generar Excel
                </Button>
            </div>
            <SuccessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Excel generado correctamente"
            />
        </div>
    )
}

export default MOD05;
