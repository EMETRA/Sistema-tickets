import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressRingStat } from "./ProgressRingStat";

const meta = {
    title: "Molecules/ProgressRingStat",
    component: ProgressRingStat,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        percentage: {
            control: { type: "range", min: 0, max: 100, step: 1 },
            description: "Porcentaje de progreso (0-100)",
        },
        label: {
            control: "text",
            description: "Texto del label debajo del anillo",
        },
        size: {
            control: { type: "range", min: 80, max: 300, step: 10 },
            description: "Tamaño del anillo en píxeles",
        },
        strokeWidth: {
            control: { type: "range", min: 5, max: 40, step: 1 },
            description: "Ancho del trazo del anillo",
        },
    },
} satisfies Meta<typeof ProgressRingStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Estado del equipo",
        percentage: 85,
    },
};

export const LowProgress: Story = {
    args: {
        label: "Tickets resueltos",
        percentage: 15,
    },
};

export const MediumProgress: Story = {
    args: {
        label: "Progreso del proyecto",
        percentage: 50,
    },
};

export const HighProgress: Story = {
    args: {
        label: "Tareas completadas",
        percentage: 85,
    },
};

export const CustomColors: Story = {
    args: {
        label: "Rendimiento",
        percentage: 75,
    },
};

export const SmallSize: Story = {
    args: {
        label: "Avance",
        percentage: 60,
        size: 120,
        strokeWidth: 15,
    },
};

export const LargeSize: Story = {
    args: {
        label: "Progreso general",
        percentage: 90,
        size: 250,
        strokeWidth: 25,
    },
};
