import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chip } from "./index";

const meta: Meta<typeof Chip> = {
    title: "Atoms/Chip",
    component: Chip,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Ingressed: Story = {
    args: { label: "Ingresado" },
};

export const IngressedWithCustomColor: Story = {
    args: { label: "Ingresado", color: "#80B918" },
};

export const Outlined: Story = {
    args: { label: "Cancelado", variant: "outlined" },
};

export const OutlinedWithCustomColor: Story = {
    args: { label: "Cancelado", variant: "outlined", color: "#E63946" },
};
