"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { FormField } from "@/components/client/molecules/FormField";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import { estadoCasoJuzgado } from "@/api/graphql/juzgado-vista";
import {
    buscarCasosJuzgado,
    mensajeJuzgado,
    type CoincidenciaJuzgado,
} from "@/api/graphql/juzgado";
import { JUZ01Schema } from "./JUZ01.schema";
import styles from "./JUZ01.module.scss";

export default function JUZ01() {
    const router = useRouter(), pathname = usePathname();
    const [caseNumber, setCaseNumber] = useState("");
    const [matches, setMatches] = useState<CoincidenciaJuzgado[]>([]);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [searchedCode, setSearchedCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const enCurso = useRef(false);
    const input = useRef<HTMLInputElement>(null);
    const resultsTitle = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (searchedCode) resultsTitle.current?.focus();
    }, [searchedCode]);

    const changeCode = (value: string) => {
        setCaseNumber(value);
        setMatches([]);
        setSearchedCode("");
        setError("");
        setFieldError(null);
    };
    const search = async () => {
        if (enCurso.current) return;
        const parsed = JUZ01Schema.safeParse({ caseNumber });
        if (!parsed.success) {
            setFieldError(z.flattenError(parsed.error).fieldErrors.caseNumber?.[0] || "Revisa el código del caso");
            input.current?.focus();
            return;
        }
        setFieldError(null);
        setError("");
        setMatches([]);
        setSearchedCode("");
        setCaseNumber(parsed.data.caseNumber);
        setLoading(true);
        enCurso.current = true;
        try {
            setMatches(await buscarCasosJuzgado(parsed.data.caseNumber));
            setSearchedCode(parsed.data.caseNumber);
        } catch (e) {
            setError(mensajeJuzgado(e, "busqueda"));
        } finally {
            setLoading(false);
            enCurso.current = false;
        }
    };

    return (
        <section className={styles.page}>
            <form className={styles.searchPanel} noValidate onSubmit={(e) => {
                e.preventDefault();
                void search();
            }} aria-busy={loading}>
                <header className={styles.searchHeading}>
                    <span className={styles.searchIcon} aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <circle cx="10.5" cy="10.5" r="6.5" />
                            <path d="m16 16 4 4" />
                        </svg>
                    </span>
                    <div>
                        <h2>Buscar un caso</h2>
                        <p>Usa los primeros 3 o 6 caracteres, o pega el código completo.</p>
                    </div>
                </header>
                <div className={styles.searchControls}>
                    <FormField label="Código de caso" htmlFor="caseNumber" required className={styles.field}>
                        <Input
                            ref={input}
                            id="caseNumber"
                            type="text"
                            value={caseNumber}
                            maxLength={64}
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            onChange={(e) => changeCode(e.target.value)}
                            placeholder="Primeros 3 o 6 caracteres o código completo"
                            state={loading ? "disabled" : fieldError ? "error" : "default"}
                            aria-invalid={!!fieldError}
                            aria-describedby={fieldError ? "codigoCasoAyuda codigoCasoError" : "codigoCasoAyuda"}
                            className={styles.codeInput}
                            required
                        />
                    </FormField>
                    <Button className={styles.searchButton} type="submit" state={loading ? "loading" : "default"} loadingText="Buscando…">
                        Consultar caso
                    </Button>
                    {!!caseNumber && (
                        <Button className={styles.clearButton} type="button" variant="outlined" state={loading ? "disabled" : "default"} onClick={() => {
                            changeCode("");
                            input.current?.focus();
                        }}>Limpiar</Button>
                    )}
                </div>
                <p id="codigoCasoAyuda" className={styles.help}>
                    El código está en el correo o documento del caso y puede incluir letras y números. Mínimo 3 caracteres.
                </p>
                {fieldError && <p id="codigoCasoError" className={styles.fieldError} role="alert">{fieldError}</p>}
                {error && <div className={styles.error} role="alert"><strong>No se pudo completar la búsqueda</strong><p>{error}</p></div>}
                {loading && <p role="status" className={styles.help}>Buscando coincidencias del código…</p>}
            </form>
            {!!searchedCode && (
                <section className={styles.results} aria-labelledby="casos-titulo">
                    <header className={styles.resultsHeader}>
                        <div>
                            <div className={styles.resultsTitle}>
                                <h2 id="casos-titulo" tabIndex={-1} ref={resultsTitle}>Resultados de la búsqueda</h2>
                                <span className={styles.count}>{matches.length}</span>
                            </div>
                            <p role="status">{matches.length === 1 ? "1 caso encontrado" : `${matches.length} casos encontrados`} para <code>{searchedCode}</code></p>
                        </div>
                        {!!matches.length && <p className={styles.help}>Comprueba la placa antes de abrir el expediente.</p>}
                    </header>
                    {!matches.length ? (
                        <div className={styles.empty}>
                            <h3>No encontramos coincidencias</h3>
                            <p>Comprueba que escribiste el inicio del código. Puedes probar con sus primeros 6 caracteres o pegarlo completo.</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <caption className={styles.srOnly}>Casos encontrados, con placa, código, estado y fecha de registro</caption>
                            <thead><tr>
                                <th scope="col">Placa</th>
                                <th scope="col">Código del caso</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Registrado</th>
                                <th scope="col"><span className={styles.srOnly}>Acción</span></th>
                            </tr></thead>
                            <tbody>{matches.map((item) => (
                                <tr key={item.codigoCaso}>
                                    <td data-label="Placa"><strong className={styles.plate}>{item.placa ? [item.usoPlaca, item.placa].filter(Boolean).join(" - ") : "Sin placa registrada"}</strong></td>
                                    <td data-label="Código del caso" className={styles.caseCode}>
                                        <code>{item.codigoCaso.toUpperCase().startsWith(searchedCode.toUpperCase()) ? <><mark>{item.codigoCaso.slice(0, searchedCode.length)}</mark>{item.codigoCaso.slice(searchedCode.length)}</> : item.codigoCaso}</code>
                                    </td>
                                    <td data-label="Estado"><span className={styles.status}>{estadoCasoJuzgado(item.estado)}</span></td>
                                    <td data-label="Registrado" className={styles.date}>{displayDate(item.registradaEn)}</td>
                                    <td className={styles.open}>
                                        <Button variant="outlined" aria-label={`Abrir caso ${item.codigoCaso}`} onClick={() => router.push(`${pathname}/detail?caseNumber=${encodeURIComponent(item.codigoCaso)}`)}>Ver caso <span aria-hidden="true">→</span></Button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}
                </section>
            )}
        </section>
    );
}
