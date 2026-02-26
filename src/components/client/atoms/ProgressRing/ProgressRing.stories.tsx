import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressRing } from "./index";

const meta: Meta<typeof ProgressRing> = {
    title: "Components/Client/Atoms/ProgressRing",
    component: ProgressRing,
    tags: ["autodocs"],
    argTypes: {
        percentage: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Ejemplo de reporte de equipo (85%)
export const TeamReport: Story = {
    args: {
        percentage: 85,
        size: 150,
    },
};

// Ejemplo de estadísticas (50%)
export const DashboardStats: Story = {
    args: {
        percentage: 50,
        size: 120,
    },
};