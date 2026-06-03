"use client";

import React, { useState } from "react";
import { Text } from "@/components/client/atoms/Text";
import { Icon } from "@/components/client/atoms/Icon";
import styles from "./MOD07.module.scss";
import { SearchField } from "@/components/client/molecules/SearchField";

interface Manual {
    id: string;
    name: string;
    url: string;
    category: "todos" | "administradores" | "desarrolladores" | "tecnicos" | "usuarios";
}

// TODO: replace with real query
const DUMMY_MANUALS: Manual[] = [
    { id: "1", name: "App rem_v1.pdf", url: "/manuals/listado-oficial-graduandos-2026.pdf", category: "todos" },
    { id: "2", name: "Estadisticas_emetra.pdf", url: "/manuals/estadisticas_emetra.pdf", category: "administradores" },
    { id: "3", name: "Manual de funciones.pdf", url: "/manuals/manual_funciones.pdf", category: "todos" },
    { id: "4", name: "Manual de juzgado.pdf", url: "/manuals/manual_juzgado.pdf", category: "tecnicos" },
    { id: "5", name: "Manual de normas.pdf", url: "/manuals/manual_normas.pdf", category: "todos" },
    { id: "6", name: "Manual siaf modulo.pdf", url: "/manuals/manual_siaf_modulo.pdf", category: "desarrolladores" },
    { id: "7", name: "Manual siaf bancos.pdf", url: "/manuals/manual_siaf_bancos.pdf", category: "desarrolladores" },
    { id: "8", name: "Manual siaf contabilidad.pdf", url: "/manuals/manual_siaf_contabilidad.pdf", category: "administradores" },
    { id: "9", name: "Manual siaf presupuesto.pdf", url: "/manuals/manual_siaf_presupuesto.pdf", category: "administradores" },
    { id: "10", name: "Manual vehiculos.pdf", url: "/manuals/manual_vehiculos.pdf", category: "tecnicos" },
    { id: "11", name: "Manual_activos_emetra.pdf", url: "/manuals/manual_activos_emetra.pdf", category: "usuarios" },
    { id: "12", name: "Manual_bodega_emetra.pdf", url: "/manuals/manual_bodega_emetra.pdf", category: "usuarios" },
    { id: "13", name: "Manual_de_transito.pdf", url: "/manuals/manual_transito.pdf", category: "tecnicos" },
    { id: "14", name: "Manual_financiero.pdf", url: "/manuals/manual_financiero.pdf", category: "administradores" },
];

interface Category {
    key: string;
    label: string;
    iconName: string;
}

const CATEGORIES: Category[] = [
    { key: "todos", label: "Todos los manuales", iconName: "people-group-solid" },
    { key: "administradores", label: "Administradores", iconName: "layer-group-solid" },
    { key: "desarrolladores", label: "Desarrolladores", iconName: "user-lock-solid" },
    { key: "tecnicos", label: "Técnicos", iconName: "user-group-solid" },
    { key: "usuarios", label: "Usuarios", iconName: "id-badge-solid" },
];

const MOD07: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState("todos");
    const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
    const [search, setSearch] = useState("");

    const filteredManuals = DUMMY_MANUALS.filter(m => {
        const matchesCategory = selectedCategory === "todos" || m.category === selectedCategory;
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.key}
                                className={`${styles.categoryItem} ${selectedCategory === cat.key ? styles.categoryActive : ""} ${selectedCategory && selectedCategory !== cat.key ? styles.categoryHidden : ""}`}
                                onClick={() => setSelectedCategory(prev => prev === cat.key ? "" : cat.key)}
                            >
                                <Icon name={cat.iconName as never} size={18} color="#000000" />
                                <Text className={styles.categoryLabel}>{cat.label}</Text>
                            </button>
                        ))}
                    </div>

                    {/* Manuals list */}
                    <div className={styles.manualsList}>
                        {filteredManuals.map(manual => (
                            <button
                                key={manual.id}
                                className={`${styles.manualItem} ${selectedManual?.id === manual.id ? styles.manualActive : ""}`}
                                onClick={() => setSelectedManual(manual)}
                            >
                                <Icon name="file" size={14} color="#000000" />
                                <Text className={styles.manualName}>{manual.name}</Text>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right panel - PDF viewer */}
                <div className={styles.rightPanel}>
                    {selectedManual ? (
                        <iframe
                            src={selectedManual.url}
                            className={styles.pdfViewer}
                            title={selectedManual.name}
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