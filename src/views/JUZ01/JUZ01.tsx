"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { Title } from "../../components/client/atoms/Title";
import { FormField } from "../../components/client/molecules/FormField";
import { Input } from "../../components/client/atoms/Input";
import { Button } from "../../components/client/atoms/Button";
import { Text } from "../../components/client/atoms/Text";
import { JUZ01Schema } from "./JUZ01.schema";

import styles from "./JUZ01.module.scss";
import {
    buscarCasosJuzgado,
    mensajeJuzgado,
    CoincidenciaJuzgado,
} from "@/api/graphql/juzgado";
import { useRef } from "react";

const JUZ01: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [caseNumber, setCaseNumber] = useState("");
    const [matches, setMatches] = useState<CoincidenciaJuzgado[]>([]);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const enCurso = useRef(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{ message: string } | null>(null);

    const handleExecute = async () => {
        if (enCurso.current) return;
        setError(null);
        setMessage(null);
        setMatches([]);

        const parsed = JUZ01Schema.safeParse({ caseNumber });
        if (!parsed.success) {
            const message =
        z.flattenError(parsed.error).fieldErrors.caseNumber?.[0] ??
        "El código de caso es requerido";
            setFieldError(message);
            return;
        }

        setFieldError(null);
        setCaseNumber(parsed.data.caseNumber);
        setLoading(true);
        enCurso.current = true;

        try {
            const result = await buscarCasosJuzgado(parsed.data.caseNumber);
            if (!result.length) {
                setMessage("Sin resultados");
                return;
            }
            setMatches(result);
        } catch (err) {
            setError({
                message: mensajeJuzgado(err),
            });
        } finally {
            setLoading(false);
            enCurso.current = false;
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Title variant="mid" tag="h3" className={styles.title}>
                    Parámetros de consulta
                </Title>

                {/* Numero de caso */}
                <FormField
                    label="Código de caso"
                    htmlFor="caseNumber"
                    required
                    className={styles.fieldCaseNumber}
                >
                    <Input
                        id="caseNumber"
                        type="text"
                        value={caseNumber}
                        onChange={(e) => {
                            setCaseNumber(e.target.value);
                            setMatches([]);
                            if (fieldError) setFieldError(null);
                        }}
                        placeholder="Primeros 5 o 6 caracteres del caso"
                        state={loading ? "disabled" : fieldError ? "error" : "default"}
                        errorMessage={fieldError ?? undefined}
                        aria-describedby="codigoCasoAyuda"
                        required
                    />
                </FormField>

                <p id="codigoCasoAyuda">
                    Escribe el inicio del código que aparece en el correo o PDF. Después
                    selecciona el caso completo para revisarlo.
                </p>
                {!!matches.length && (
                    <div aria-label="Casos encontrados">
                        <p>{matches.length} coincidencia(s). Selecciona el caso:</p>
                        <ul>
                            {matches.map((item) => (
                                <li key={item.codigoCaso}>
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            router.push(
                                                `${pathname}/detail?caseNumber=${encodeURIComponent(item.codigoCaso)}`,
                                            )
                                        }
                                    >
                                        {item.codigoCaso} · {item.estado.replaceAll("_", " ")}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <Button
                    variant="contained"
                    color="default"
                    onClick={handleExecute}
                    className={styles.executeButton}
                    state={loading ? "disabled" : "default"}
                >
                    {loading ? "Consultando caso..." : "Consultar caso"}
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
    );
};

export default JUZ01;
