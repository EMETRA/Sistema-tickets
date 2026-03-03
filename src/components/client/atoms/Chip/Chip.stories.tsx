import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chip } from "./index";

const meta: Meta<typeof Chip> = {
    title: "Components/Client/Atoms/Chip",
    component: Chip,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Ingressed: Story = {
    args: { label: "Ingresado", state: "ingressed" },
};

export const Assigned: Story = {
    args: { label: "Asignado", state: "assigned" },
};

export const Inwork: Story = {
    args: { label: "En trabajo", state: "inwork" },
};

export const Resolved: Story = {
    args: { label: "Resuelto", state: "resolved" },
};

export const Canceled: Story = {
    args: { label: "Cancelado", state: "canceled" },
};

export const FilterOption: Story = {
    args: { label: "Cancelado", variant: "outlined", state: "canceled" },
};

export const FilterSelected: Story = {
    args: { label: "En trabajo", variant: "outlined", state: "inwork" },
};
