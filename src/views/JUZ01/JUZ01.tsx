"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { FormField } from "@/components/client/molecules/FormField";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import {
    buscarCasosJuzgado,
    mensajeJuzgado,
    type CoincidenciaJuzgado,
} from "@/api/graphql/juzgado";
import { JUZ01Schema } from "./JUZ01.schema";
import styles from "./JUZ01.module.scss";

export default function JUZ01() {
    const router = useRouter(),
        pathname = usePathname();
    const [caseNumber, setCaseNumber] = useState("");
    const [matches, setMatches] = useState<CoincidenciaJuzgado[]>([]);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const enCurso = useRef(false);
    const search = async () => {
        if (enCurso.current) return;
        const parsed = JUZ01Schema.safeParse({ caseNumber });
        if (!parsed.success) {
            setFieldError(
                z.flattenError(parsed.error).fieldErrors.caseNumber?.[0] ||
          "Revisa el código del caso",
            );
            return;
        }
        setFieldError(null);
        setError("");
        setMatches([]);
        setSearched(false);
        setCaseNumber(parsed.data.caseNumber);
        setLoading(true);
        enCurso.current = true;
        try {
            setMatches(await buscarCasosJuzgado(parsed.data.caseNumber));
            setSearched(true);
        } catch (e) {
            setError(mensajeJuzgado(e));
        } finally {
            setLoading(false);
            enCurso.current = false;
        }
    };
    return (
        <section className={styles.page}>
            <form
                className={styles.searchPanel}
                onSubmit={(e) => {
                    e.preventDefault();
                    void search();
                }}
            >
                <header>
                    <h2>Buscar un caso</h2>
                    <p>
                        Ingresa al menos los primeros seis caracteres del código recibido
                        por correo o en el documento.
                    </p>
                </header>
                <div className={styles.searchControls}>
                    <FormField
                        label="Código de caso"
                        htmlFor="caseNumber"
                        required
                        className={styles.field}
                    >
                        <Input
                            id="caseNumber"
                            type="text"
                            value={caseNumber}
                            maxLength={36}
                            autoComplete="off"
                            spellCheck={false}
                            onChange={(e) => {
                                setCaseNumber(e.target.value);
                                setMatches([]);
                                setSearched(false);
                                setError("");
                                setFieldError(null);
                            }}
                            placeholder="Primeros 6 caracteres o código completo"
                            state={loading ? "disabled" : fieldError ? "error" : "default"}
                            errorMessage={fieldError || undefined}
                            aria-describedby="codigoCasoAyuda"
                            required
                        />
                    </FormField>
                    <Button
                        type="submit"
                        variant="contained"
                        state={loading ? "disabled" : "default"}
                    >
                        {loading ? "Buscando…" : "Consultar caso"}
                    </Button>
                </div>
                <p id="codigoCasoAyuda" className={styles.help}>
                    Puedes pegar el código completo. Comprueba la placa antes de abrir el
                    expediente.
                </p>
                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}
                {loading && (
                    <p role="status" className={styles.help}>
                        Buscando coincidencias…
                    </p>
                )}
            </form>
            {searched && (
                <section className={styles.results} aria-labelledby="casos-titulo">
                    <header className={styles.resultsHeader}>
                        <div>
                            <h2 id="casos-titulo">Resultados de la búsqueda</h2>
                            <p role="status">
                                {matches.length === 1
                                    ? "1 caso encontrado"
                                    : `${matches.length} casos encontrados`}
                            </p>
                        </div>
                        {!!matches.length && (
                            <span className={styles.help}>
                                Selecciona el caso que corresponde a la placa.
                            </span>
                        )}
                    </header>
                    {!matches.length ? (
                        <div className={styles.empty}>
                            <h3>No encontramos coincidencias</h3>
                            <p>
                                Revisa los seis caracteres iniciales o busca con el código
                                completo.
                            </p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <caption className={styles.srOnly}>
                                Casos encontrados, con placa, código, estado y fecha de registro
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col">Placa</th>
                                    <th scope="col">Código del caso</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Registrado</th>
                                    <th scope="col">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((item) => (
                                    <tr key={item.codigoCaso}>
                                        <td data-label="Placa">
                                            <strong className={styles.plate}>
                                                {item.placa
                                                    ? [item.usoPlaca, item.placa]
                                                        .filter(Boolean)
                                                        .join(" - ")
                                                    : "Sin placa registrada"}
                                            </strong>
                                        </td>
                                        <td
                                            data-label="Código del caso"
                                            className={styles.caseCode}
                                        >
                                            <code>{item.codigoCaso}</code>
                                        </td>
                                        <td data-label="Estado">
                                            <span className={styles.status}>
                                                {item.estado.replaceAll("_", " ")}
                                            </span>
                                        </td>
                                        <td data-label="Registrado">
                                            {displayDate(item.registradaEn)}
                                        </td>
                                        <td className={styles.open}>
                                            <Button
                                                variant="outlined"
                                                aria-label={`Abrir caso ${item.codigoCaso}`}
                                                onClick={() =>
                                                    router.push(
                                                        `${pathname}/detail?caseNumber=${encodeURIComponent(item.codigoCaso)}`,
                                                    )
                                                }
                                            >
                                                Ver caso
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}
        </section>
    );
}
