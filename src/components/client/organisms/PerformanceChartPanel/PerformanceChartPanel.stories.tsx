import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PerformanceChartPanel } from "./PerformanceChartPanel";
import { useState } from "react";

// Datos de ejemplo para los gráficos
const sampleData = [
    { label: "Monica", value: 38000 },
    { label: "Joey", value: 35000 },
    { label: "Ross", value: 26000 },
    { label: "Phoebe", value: 19000 },
    { label: "Rachel", value: 16000 },
    { label: "Chandler", value: 12000 },
];

const sampleData2 = [
    { label: "Monica", value: 47000 },
    { label: "Joey", value: 35000 },
    { label: "Ross", value: 26000 },
    { label: "Phoebe", value: 16000 },
    { label: "Rachel", value: 16000 },
    { label: "Chandler", value: 11000 },
    { label: "Sofia", value: 17000 },
    { label: "Andrea", value: 28000 },
];

const meta = {
    title: "Organisms/PerformanceChartPanel",
    component: PerformanceChartPanel,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["primary", "secondary"],
            description: "Variante del panel",
        },
        data: {
            description: "Datos para el gráfico de barras",
        },
    },
} satisfies Meta<typeof PerformanceChartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Variante primary con filtros simples
 */
export const Primary: Story = {
    args: {
        variant: "primary",
        data: sampleData,
        selectedFilter: "today",
        onFilterChange: (filter) => console.log("Filter changed:", filter),
    },
};

/**
 * Variante secondary con filtros jerárquicos
 */
export const Secondary: Story = {
    args: {
        variant: "secondary",
        data: sampleData2,
        filterConfig: {
            parentOptions: [
                { label: "RRHH", value: "hr" },
                { label: "Informática", value: "it" },
                { label: "Finanzas", value: "finance" },
                { label: "Administrativa", value: "admin" },
                { label: "General", value: "general" },
            ],
            childOptionsByParent: {
                hr: [
                    { label: "Todos", value: "all" },
                    { label: "Contratación", value: "hiring" },
                    { label: "Formación", value: "training" },
                ],
                it: [
                    { label: "General", value: "general" },
                    { label: "Tesorería", value: "treasury" },
                    { label: "Contabilidad", value: "accounting" },
                    { label: "Inventario", value: "inventory" },
                    { label: "Compras", value: "purchases" },
                ],
                finance: [
                    { label: "Presupuesto", value: "budget" },
                    { label: "Inversiones", value: "investments" },
                    { label: "Auditoría", value: "audit" },
                ],
                admin: [
                    { label: "Documentación", value: "docs" },
                    { label: "Logística", value: "logistics" },
                ],
                general: [
                    { label: "Mantenimiento", value: "maintenance" },
                    { label: "Servicio al cliente", value: "customer-service" },
                ],
            },
        },
        selectedParentFilter: "finance",
        selectedChildFilter: "treasury",
        onParentFilterChange: (filter) => console.log("Parent filter changed:", filter),
        onChildFilterChange: (filter) => console.log("Child filter changed:", filter),
    },
};

/**
 * Primary - Filtro Anual
 */
export const PrimaryAnnual: Story = {
    args: {
        variant: "primary",
        data: sampleData,
        selectedFilter: "annual",
        onFilterChange: (filter) => console.log("Filter changed:", filter),
    },
};

/**
 * Primary interactivo con cambio de filtro
 */
export const PrimaryInteractive = {
    render: () => {
        const [filter, setFilter] = useState<"annual" | "monthly" | "weekly" | "today">("today");

        // Simular datos diferentes por filtro
        const dataByFilter = {
            annual: sampleData,
            monthly: sampleData2,
            weekly: [
                { label: "Monica", value: 5000 },
                { label: "Joey", value: 4200 },
                { label: "Ross", value: 3800 },
            ],
            today: [
                { label: "Monica", value: 800 },
                { label: "Joey", value: 650 },
            ],
        };

        return (
            <PerformanceChartPanel
                variant="primary"
                data={dataByFilter[filter]}
                selectedFilter={filter}
                onFilterChange={setFilter}
            />
        );
    },
};

/**
 * Secondary interactivo con cambio de filtros
 */
export const SecondaryInteractive = {
    render: () => {
        const [parentFilter, setParentFilter] = useState("it");
        const [childFilter, setChildFilter] = useState("treasury");

        const filterConfig = {
            parentOptions: [
                { label: "RRHH", value: "hr" },
                { label: "Informática", value: "it" },
                { label: "Finanzas", value: "finance" },
                { label: "Administrativa", value: "admin" },
                { label: "General", value: "general" },
                { label: "Ingresos", value: "income" },
                { label: "Auditoría", value: "audit" },
                { label: "PMT", value: "pmt" },
            ],
            childOptionsByParent: {
                hr: [
                    { label: "Todos", value: "all" },
                    { label: "Contratación", value: "hiring" },
                    { label: "Formación", value: "training" },
                ],
                it: [
                    { label: "General", value: "general" },
                    { label: "Tesorería", value: "treasury" },
                    { label: "Contabilidad", value: "accounting" },
                    { label: "Inventario", value: "inventory" },
                    { label: "Compras", value: "purchases" },
                ],
                finance: [
                    { label: "Presupuesto", value: "budget" },
                    { label: "Inversiones", value: "investments" },
                    { label: "Auditoría", value: "audit" },
                ],
                admin: [
                    { label: "Documentación", value: "docs" },
                    { label: "Logística", value: "logistics" },
                ],
                general: [
                    { label: "Mantenimiento", value: "maintenance" },
                    { label: "Servicio al cliente", value: "customer-service" },
                ],
                income: [
                    { label: "Ventas", value: "sales" },
                    { label: "Servicios", value: "services" },
                ],
                audit: [
                    { label: "Interna", value: "internal" },
                    { label: "Externa", value: "external" },
                ],
                pmt: [
                    { label: "Proyectos", value: "projects" },
                    { label: "Seguimiento", value: "tracking" },
                ],
            },
        };

        // Datos específicos por combinación de filtros
        const dataByFilters: Record<string, Record<string, typeof sampleData>> = {
            hr: {
                all: sampleData2,
                hiring: [
                    { label: "Monica", value: 25000 },
                    { label: "Joey", value: 18000 },
                    { label: "Ross", value: 22000 },
                    { label: "Phoebe", value: 15000 },
                ],
                training: [
                    { label: "Rachel", value: 32000 },
                    { label: "Chandler", value: 28000 },
                    { label: "Monica", value: 35000 },
                    { label: "Ross", value: 20000 },
                    { label: "Joey", value: 17000 },
                ],
            },
            it: {
                general: sampleData,
                treasury: sampleData2,
                accounting: [
                    { label: "Monica", value: 42000 },
                    { label: "Joey", value: 38000 },
                    { label: "Ross", value: 31000 },
                    { label: "Andrea", value: 29000 },
                    { label: "Sofia", value: 25000 },
                ],
                inventory: [
                    { label: "Phoebe", value: 19000 },
                    { label: "Rachel", value: 23000 },
                    { label: "Chandler", value: 21000 },
                ],
                purchases: [
                    { label: "Monica", value: 55000 },
                    { label: "Andrea", value: 48000 },
                    { label: "Joey", value: 42000 },
                    { label: "Ross", value: 38000 },
                    { label: "Sofia", value: 35000 },
                    { label: "Rachel", value: 30000 },
                ],
            },
        };

        // Obtener datos basados en los filtros seleccionados
        const getCurrentData = () => {
            return dataByFilters[parentFilter]?.[childFilter] || sampleData2;
        };

        const handleParentChange = (newParent: string) => {
            setParentFilter(newParent);
            // Resetear el hijo al primero disponible
            const childOptions = filterConfig.childOptionsByParent as Record<string, Array<{ label: string; value: string }>>;
            const firstChild = childOptions[newParent]?.[0]?.value || "";
            setChildFilter(firstChild);
        };

        return (
            <div>
                <PerformanceChartPanel
                    variant="secondary"
                    data={getCurrentData()}
                    filterConfig={filterConfig}
                    selectedParentFilter={parentFilter}
                    selectedChildFilter={childFilter}
                    onParentFilterChange={handleParentChange}
                    onChildFilterChange={setChildFilter}
                />
                <div style={{ marginTop: "20px", padding: "10px", background: "#f5f5f5" }}>
                    <p>Filtro padre: <strong>{parentFilter}</strong></p>
                    <p>Filtro hijo: <strong>{childFilter}</strong></p>
                </div>
            </div>
        );
    },
};
