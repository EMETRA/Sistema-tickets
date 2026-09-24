import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketStateChip } from "./TicketStateChip";

const meta: Meta<typeof TicketStateChip> = {
    title: "Atoms/TicketStateChip",
    component: TicketStateChip,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Ingressed: Story = {
    args: { label: "Ingresado", state: "ingresado" },
};

export const Assigned: Story = {
    args: { label: "Asignado", state: "asignado" },
};

export const Inwork: Story = {
    args: { label: "En trabajo", state: "en_trabajo" },
};

export const Resolved: Story = {
    args: { label: "Resuelto", state: "completado" },
};

export const Canceled: Story = {
    args: { label: "Cancelado", state: "cancelado" },
};

export const FilterOption: Story = {
    args: { label: "Cancelado", variant: "outlined", state: "cancelado" },
};

export const FilterSelected: Story = {
    args: { label: "En trabajo", variant: "outlined", state: "en_trabajo" },
};
