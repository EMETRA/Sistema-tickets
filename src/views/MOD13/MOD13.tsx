"use client";

import { useState } from "react";
import styles from "./MOD13.module.scss";
import type { MOD13SearchResult } from "./types";

const DUMMY_RESULT: MOD13SearchResult = {
    errors: ["No se encontraron vehículos asociados al nombre asociado"],
    debugLines: [
        "DUMMY DATA - A manera de simulación de la búsqueda real, se muestran los pasos que se ejecutarían en el backend.",
        "Inicio POST",
        "Nombre ingresado: Probando",
        "Conexión Oracle OK",
        "COUNT BASEDATOS.EMT_VEHICULOS = 2284582",
        "COUNT ADMEMETRA.TB_DATOS_LASER = 350168",
        "COUNT ADMEMETRA.TB_DATOS_VIA = 9",
        "COUNT ADMEMETRA.TB_DATOS_KAPSCH = 39595",
        "COUNT ADMEMETRA.TB_DATOS_NEURAL = 62090",
        "USUARIO ACTUAL = GZAMORA",
        "DB NAME = MUNI",
        "SERVICE NAME = MUNI",
        "Nombre búsqueda normalizado: PROBANDO",
        "Tokens búsqueda: PROBANDO",
        "Filas exactas: 0",
        "Filas por tokens o exacta: 0",
        "Filtrados: 0",
        "Resultado local final: 0",
        "Vehículos encontrados localmente: 0",
        "No hubo resultados locales. Intentando SAT...",
        "SAT combos intentados: 0",
        "SAT NIT encontrados: 0",
        "SAT vehículos obtenidos: 0",
        "Vehículos encontrados por SAT: 0",
        "Vehículos encontrados en búsqueda híbrida: 0",
    ],
};

export default function MOD13() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<MOD13SearchResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        // TODO: replace with real API call
        await new Promise((r) => setTimeout(r, 600));
        setResult(DUMMY_RESULT);
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div className={styles.content}>
            <div className={styles.wrapper}>

                {/* Search */}
                <p className={styles.searchLabel}>Búsqueda EMETRA</p>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button
                        type="button"
                        className={styles.searchButton}
                        onClick={handleSearch}
                        disabled={loading}
                        aria-label="Buscar"
                    >
                        {loading ? (
                            <span className={styles.spinner} />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>

                {result && (
                    <>
                        {/* Errors */}
                        {result.errors.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Errores</h2>
                                <div className={styles.errorBox}>
                                    {result.errors.map((err, i) => (
                                        <p key={i} className={styles.errorLine}>{err}</p>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Debug */}
                        {result.debugLines.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Depuración</h2>
                                <div className={styles.debugBox}>
                                    {result.debugLines.map((line, i) => (
                                        <p key={i} className={styles.debugLine}>{line}</p>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}