"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { z } from 'zod';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Input } from "../../components/client/atoms/Input";
import { Button } from '../../components/client/atoms/Button';
import { Text } from '../../components/client/atoms/Text';
import { JUZ01Schema } from './JUZ01.schema';

import styles from './JUZ01.module.scss';

/**
 * DUMMY - BORRAAAAAAR
 */
const consultarCaso = async (caseNumber: string) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });

    if (Math.random() > 0.7) {
        throw new Error('No se pudo consultar el caso');
    } else if (Math.random() > 0.5) {
        return undefined;
    }

    return { caseNumber };
};

const JUZ01: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [caseNumber, setCaseNumber] = useState('');
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    // MOCK - BORRAAAAAAR
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{ message: string } | null>(null);

    const handleExecute = async () => {
        setError(null);

        const parsed = JUZ01Schema.safeParse({ caseNumber });
        if (!parsed.success) {
            const message = z.flattenError(parsed.error).fieldErrors.caseNumber?.[0]
                ?? 'El número de caso es requerido';
            setFieldError(message);
            return;
        }

        setFieldError(null);
        setCaseNumber(parsed.data.caseNumber);
        setLoading(true);

        try {
            const result = await consultarCaso(parsed.data.caseNumber);
            if (!result) {
                setMessage('Sin resultados');
                return;
            }
            router.push(`${pathname}/detail?caseNumber=${encodeURIComponent(result.caseNumber)}`);
        } catch (err) {
            setError({
                message: err instanceof Error ? err.message : 'No se pudo consultar el caso',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Title variant="mid" tag="h3" className={styles.title}>Parámetros de consulta</Title>

                {/* Numero de caso */}
                <FormField label="Número de caso" htmlFor="caseNumber" required className={styles.fieldCaseNumber}>
                    <Input
                        id="caseNumber"
                        type="text"
                        value={caseNumber}
                        onChange={(e) => {
                            setCaseNumber(e.target.value);
                            if (fieldError) setFieldError(null);
                        }}
                        placeholder="Ingresa el número de caso"
                        state={loading ? "disabled" : fieldError ? "error" : "default"}
                        errorMessage={fieldError ?? undefined}
                        required
                    />
                </FormField>

                <Button
                    variant="contained"
                    color="default"
                    onClick={handleExecute}
                    className={styles.executeButton}
                    state={loading ? "disabled" : "default"}
                >
                    {loading ? 'Consultando caso...' : 'Consultar caso'}
                </Button>

                {error && (
                    <Text variant="caption" className={styles.errorText}>
                        Error: {error.message}
                    </Text>
                )}

                {message && (
                    <Text variant="body" className={styles.messageText}>
                        {message}
                    </Text>
                )}

                <Text variant="caption" className={styles.footerText}>
                    Dirección de Informática · Municipalidad de Guatemala
                </Text>
            </div>
        </div>
    )
}

export default JUZ01;
