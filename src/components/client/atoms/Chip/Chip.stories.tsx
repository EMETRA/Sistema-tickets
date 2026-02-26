import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chip } from "./index";

const meta: Meta<typeof Chip> = {
    title: "Components/Client/Atoms/Chip",
    component: Chip,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Assigned: Story = {
    args: { label: "Asignado", state: "active" },
};

export const InProcess: Story = {
    args: { label: "En Proceso", state: "warning" },
};

export const FilterSelected: Story = {
    args: { label: "Todos", variant: "outlined", state: "active" },
};

export const AssignedWithDot: Story = {
    args: { label: "Asignado", state: "active" },
};

export const ResolvedWithDot: Story = {
    args: { label: "Resuelto", state: "success" },
};

export const FilterOption: Story = {
    args: { label: "Técnicos", variant: "outlined", state: "inactive" },
};