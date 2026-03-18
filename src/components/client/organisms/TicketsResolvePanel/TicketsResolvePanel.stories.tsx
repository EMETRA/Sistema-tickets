import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketsResolvePanel } from "./TicketsResolvePanel";

const meta = {
    title: "Organisms/TicketsResolvePanel",
    component: TicketsResolvePanel,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        data: {
            description: "Datos para el gráfico de dona (tickets resueltos por categoría/tipo)",
        },
        size: {
            control: "number",
            description: "Tamaño del gráfico en píxeles",
        },
        strokeWidth: {
            control: "number",
            description: "Grosor del anillo de la dona",
        },
    },
} satisfies Meta<typeof TicketsResolvePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Panel con datos de ejemplo
 */
export const Default: Story = {
    args: {
        data: [
            { label: "Hardware", value: 45, color: "#FF9100" },
            { label: "Software", value: 32, color: "#00BC70" },
            { label: "Red", value: 28, color: "#FFCE00" },
            { label: "Acceso", value: 15, color: "#E63946" },
        ],
    },
};

/**
 * Panel con tamaño personalizado
 */
export const CustomSize: Story = {
    args: {
        data: [
            { label: "Hardware", value: 45, color: "#FF9100" },
            { label: "Software", value: 32, color: "#00BC70" },
            { label: "Red", value: 28, color: "#FFCE00" },
            { label: "Acceso", value: 15, color: "#E63946" },
        ],
        size: 300,
        strokeWidth: 40,
    },
};

/**
 * Panel con muchas categorías
 */
export const ManyCategories: Story = {
    args: {
        data: [
            { label: "Hardware", value: 45 },
            { label: "Software", value: 32 },
            { label: "Red", value: 28 },
            { label: "Acceso", value: 15 },
            { label: "Impresoras", value: 22 },
            { label: "Seguridad", value: 18 },
            { label: "Capacitación", value: 10 },
        ],
    },
};

/**
 * Panel con valores bajos
 */
export const LowVolume: Story = {
    args: {
        data: [
            { label: "Hardware", value: 5, color: "#FF9100" },
            { label: "Software", value: 3, color: "#00BC70" },
            { label: "Red", value: 2, color: "#FFCE00" },
            { label: "Acceso", value: 1, color: "#E63946" },
        ],
    },
};

/**
 * Panel con valores altos
 */
export const HighVolume: Story = {
    args: {
        data: [
            { label: "Hardware", value: 450, color: "#FF9100" },
            { label: "Software", value: 320, color: "#00BC70" },
            { label: "Red", value: 280, color: "#FFCE00" },
            { label: "Acceso", value: 150, color: "#E63946" },
            { label: "Seguridad", value: 200, color: "#1700A5" },
        ],
    },
};

/**
 * Panel con solo dos categorías
 */
export const TwoCategories: Story = {
    args: {
        data: [
            { label: "Resueltos", value: 85, color: "#00BC70" },
            { label: "Cancelados", value: 15, color: "#E63946" },
        ],
    },
};

/**
 * Panel con distribución equilibrada
 */
export const Balanced: Story = {
    args: {
        data: [
            { label: "Hardware", value: 25, color: "#FF9100" },
            { label: "Software", value: 25, color: "#00BC70" },
            { label: "Red", value: 25, color: "#FFCE00" },
            { label: "Acceso", value: 25, color: "#E63946" },
        ],
    },
};

/**
 * Panel con colores automáticos (sin especificar)
 */
export const AutoColors: Story = {
    args: {
        data: [
            { label: "Categoría A", value: 30 },
            { label: "Categoría B", value: 25 },
            { label: "Categoría C", value: 20 },
            { label: "Categoría D", value: 15 },
            { label: "Categoría E", value: 10 },
        ],
    },
};
