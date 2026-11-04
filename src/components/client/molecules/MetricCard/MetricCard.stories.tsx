import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MetricCard } from "./MetricCard";
const meta = {
    title: "Molecules/MetricCard",
    component: MetricCard,
    parameters: { layout: "padded" },
    args: {
        label: "Tickets creados",
        value: 12,
        caption: "Datos de ejemplo de Storybook",
    },
} satisfies Meta<typeof MetricCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ConDato: Story = {};
export const DatoNoDisponible: Story = {
    args: { value: undefined, caption: "Sin un valor confirmado" },
};
export const CeroConfirmado: Story = { args: { value: 0 } };
