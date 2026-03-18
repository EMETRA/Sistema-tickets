import { BarChartDataPoint } from "@/components/client/atoms/BarChart/types";
import { SecondaryFilterConfig } from "@/components/client/organisms/PerformanceChartPanel/types";

const SECONDARY_FILTER_CONFIG: SecondaryFilterConfig = {
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

const SECONDARY_PERFORMANCE_DATA: Record<string, Record<string, BarChartDataPoint[]>> = {
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

export async function getStatisticsFilterConfigDummy(): Promise<SecondaryFilterConfig> {
    return {
        parentOptions: SECONDARY_FILTER_CONFIG.parentOptions.map((item) => ({ ...item })),
        childOptionsByParent: Object.fromEntries(
            Object.entries(SECONDARY_FILTER_CONFIG.childOptionsByParent).map(([parent, children]) => [
                parent,
                children.map((item) => ({ ...item })),
            ])
        ),
    };
}

export async function getStatisticsPerformanceDummy(
    parentFilter: string,
    childFilter: string
): Promise<BarChartDataPoint[]> {

    const parentData = SECONDARY_PERFORMANCE_DATA[parentFilter] || {};
    const data = parentData[childFilter] || [];
    return data.map((item) => ({ ...item }));
}
