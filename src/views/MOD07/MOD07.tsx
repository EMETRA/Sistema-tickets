"use client";

import React, { useState, useMemo } from "react";
import { Text } from "@/components/client/atoms/Text";
import { Icon } from "@/components/client/atoms/Icon";
import styles from "./MOD07.module.scss";
import { SearchField } from "@/components/client/molecules/SearchField";

import { useGetManualesCategorias, useGetManualesAgrupados } from "@/api/hooks";
import type { ManualInfo } from '@/api/graphql/MOD07';

const CATEGORIES_ICONS = {
    "todos": "people-group-solid",
    "SIAF": "layer-group-solid",
    "EMETRA": "emetra-solid",
    "PMT": "user-group-solid",
    "VEHICULOS": "car-solid",
    "FINANCIERO": "bank-solid",
    "NORMAS": "papers-solid",
    "OTROS": "id-badge-solid"
};

const MOD07: React.FC = () => {
    const { data: manualesCategorias, loading: loadingCategorias, error: errorCategorias } = useGetManualesCategorias();
    const { data: manualesAgrupados, loading: loadingAgrupados, error: errorAgrupados } = useGetManualesAgrupados();

    const [selectedCategory, setSelectedCategory] = useState<string>("todos");
    const [selectedManual, setSelectedManual] = useState<ManualInfo | null>(null);
    const [search, setSearch] = useState<string>("");

    const allManuales: ManualInfo[] = useMemo(() => {
        if (!manualesAgrupados) return [];
        return manualesAgrupados.flatMap(group => group.manuales || []);
    }, [manualesAgrupados]);

    const filteredManuals = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return allManuales.filter(m => {
            const matchesCategory = selectedCategory === 'todos' || String(m.categoria) === selectedCategory;
            const hay = (m.titulo || m.nombreArchivo || '').toLowerCase();
            const matchesSearch = !searchLower || hay.includes(searchLower);
            return matchesCategory && matchesSearch;
        });
    }, [allManuales, selectedCategory, search]);

    return (
        <div className={styles.mainContainer}>
            <div className={styles.panelLayout}>

                {/* Left panel */}
                <div className={styles.leftPanel}>
                    <Text className={styles.panelTitle}>Manuales disponibles</Text>

                    {/* Search */}
                    <SearchField
                        value={search}
                        placeholder="Buscar manual..."
                        onChange={setSearch}
                        onSearch={() => {}}
                    />

                    {/* Categories */}
                    <div className={styles.categories}>
                        {loadingCategorias && <Text>Cargando categorías...</Text>}
                        {errorCategorias && <Text variant="caption" className={styles.errorText}>{errorCategorias.message}</Text>}
                        {manualesCategorias.map(cat => (
                            <button
                                key={cat.codigo}
                                className={`${styles.categoryItem} ${selectedCategory === cat.codigo ? styles.categoryActive : ""} ${selectedCategory && selectedCategory !== cat.codigo ? styles.categoryHidden : ""}`}
                                onClick={() => setSelectedCategory(prev => prev === cat.codigo ? "" : cat.codigo)}
                            >
                                <Icon name={CATEGORIES_ICONS[cat.codigo] || "folder-solid"} size={18} color="#000000" />
                                <Text className={styles.categoryLabel}>{cat.etiqueta}</Text>
                            </button>
                        ))}
                    </div>

                    {/* Manuals list */}
                    <div className={styles.manualsList}>
                        {loadingAgrupados && <Text>Cargando manuales...</Text>}
                        {errorAgrupados && <Text variant="caption" className={styles.errorText}>{errorAgrupados.message}</Text>}
                        {!loadingAgrupados && !errorAgrupados && filteredManuals.length === 0 && selectedCategory !== "" && (
                            <Text variant="caption">No se encontraron manuales.</Text>
                        )}

                        {filteredManuals.map(manual => (
                            <button
                                key={String(manual.id)}
                                className={`${styles.manualItem} ${selectedManual?.id === manual.id ? styles.manualActive : ""}`}
                                onClick={() => setSelectedManual(manual)}
                            >
                                <Icon name="file" size={14} color="#000000" />
                                <Text className={styles.manualName}>{manual.titulo || manual.nombreArchivo}</Text>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right panel - PDF viewer */}
                <div className={styles.rightPanel}>
                    {selectedManual ? (
                        <iframe
                            src={selectedManual.urlVisualizacionAbsoluta || selectedManual.urlVisualizacion}
                            className={styles.pdfViewer}
                            title={selectedManual.titulo || selectedManual.nombreArchivo}
                        />
                    ) : (
                        <div className={styles.emptyState}>
                            <Text className={styles.emptyTitle}>Seleccione un manual del panel izquierdo</Text>
                            <Text className={styles.emptySubtitle}>Los manuales se mostrarán directamente en la pantalla</Text>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MOD07;
