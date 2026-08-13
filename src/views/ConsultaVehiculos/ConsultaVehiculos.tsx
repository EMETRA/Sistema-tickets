"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Input } from '../../components/client/atoms/Input';
import { Button } from '../../components/client/atoms/Button';
import { Card } from '../../components/client/atoms/Card';
import { Select } from '../../components/client/atoms/Select';

import styles from './ConsultaVehiculos.module.scss';
import { USO_VEHICULO_OPTIONS } from './types';
import { useConsultaVehiculoMuni } from '@/api/hooks';
import type { TipoUsoVehiculo, VehiculoMuni } from '@/api/graphql/apps/types';

/** Placa sin prefijo: solo letras/números, 2 a 10 caracteres (ej. 048BRC). */
const PLACA_REGEX = /^[A-Z0-9]{2,10}$/;

const VEHICULO_FIELDS: Array<{ key: keyof VehiculoMuni; label: string }> = [
    { key: 'color', label: 'Color' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
];

const PROPIETARIO_FIELDS: Array<{ key: keyof VehiculoMuni; label: string }> = [
    { key: 'nombrePropietario', label: 'Nombre' },
    { key: 'nitPropietario', label: 'NIT' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'correo', label: 'Correo' },
    { key: 'telefono', label: 'Teléfono' },
];

const ConsultaVehiculos: React.FC = () => {
    const { consultarVehiculo, loading, error } = useConsultaVehiculoMuni();

    const [uso, setUso] = useState<string>('');
    const [placa, setPlaca] = useState<string>('');
    const [placaError, setPlacaError] = useState<string>('');
    const [usoError, setUsoError] = useState<string>('');
    const [result, setResult] = useState<VehiculoMuni | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleConsultar = async () => {
        const normalizedPlaca = placa.trim().toUpperCase();

        const nextUsoError = uso ? '' : 'Seleccione el tipo de uso de la placa.';
        const nextPlacaError = PLACA_REGEX.test(normalizedPlaca)
            ? ''
            : 'Ingrese una placa válida (2 a 10 caracteres, sin prefijo).';

        setUsoError(nextUsoError);
        setPlacaError(nextPlacaError);

        if (nextUsoError || nextPlacaError) return;

        setResult(null);
        setHasSearched(true);

        try {
            const vehiculo = await consultarVehiculo({
                uso: uso as TipoUsoVehiculo,
                placa: normalizedPlaca,
            });
            setResult(vehiculo);
        } catch (err) {
            console.error('Error consultando vehículo en SAT:', err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleConsultar();
    };

    const renderFieldGroup = (
        title: string,
        fields: Array<{ key: keyof VehiculoMuni; label: string }>
    ) => {
        const available = fields.filter((field) => result?.[field.key]);

        if (available.length === 0) return null;

        return (
            <div className={styles.fieldGroup}>
                <p className={styles.fieldGroupTitle}>{title}</p>
                <div className={styles.cardsContainer}>
                    {available.map((field) => (
                        <Card
                            key={field.key}
                            title={field.label}
                            value={result?.[field.key] ?? '—'}
                            variant="info"
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Title variant="mid" tag="h3" className={styles.title}>
                    Consulta de Vehículos
                </Title>

                <FormField label="Uso" htmlFor="uso" required>
                    <Select
                        id="uso"
                        value={uso}
                        onChange={(e) => setUso(e.target.value)}
                        options={USO_VEHICULO_OPTIONS}
                        placeholder="Seleccionar uso"
                        state={usoError ? 'error' : 'default'}
                        errorMessage={usoError}
                    />
                </FormField>

                <FormField label="Placa" htmlFor="placa" required>
                    <Input
                        id="placa"
                        type="text"
                        placeholder="Ej. 048BRC"
                        value={placa}
                        maxLength={10}
                        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        state={placaError ? 'error' : 'default'}
                        errorMessage={placaError}
                    />
                </FormField>

                <Button
                    variant="contained"
                    color="default"
                    onClick={handleConsultar}
                    className={styles.searchButton}
                    state={loading ? 'loading' : 'default'}
                    loadingText="Consultando..."
                >
                    Consultar
                </Button>

                <p className={styles.hint}>
                    La consulta se realiza en línea contra SAT y puede tardar varios segundos.
                </p>
            </div>

            <div className={styles.resultsContainer}>
                {error && (
                    <div className={styles.errorBox}>
                        <p className={styles.errorLine}>{error.message}</p>
                    </div>
                )}

                {!error && hasSearched && !loading && result && (
                    <>
                        {renderFieldGroup('Datos del vehículo', VEHICULO_FIELDS)}
                        {renderFieldGroup('Datos del propietario', PROPIETARIO_FIELDS)}

                        {VEHICULO_FIELDS.every((f) => !result[f.key]) &&
                            PROPIETARIO_FIELDS.every((f) => !result[f.key]) && (
                            <div className={styles.errorBox}>
                                <p className={styles.errorLine}>
                                    SAT no devolvió datos para la placa consultada.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ConsultaVehiculos;
