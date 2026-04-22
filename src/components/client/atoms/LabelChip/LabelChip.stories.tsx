import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LabelChip } from "./index";

const meta: Meta<typeof LabelChip> = {
    title: "Atoms/LabelChip",
    component: LabelChip,
    tags: ["autodocs"],
    argTypes: {
        onRemove: { action: "removed" },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default removable chip — mirrors the screenshot behavior
export const Default: Story = {
    args: {
        label: "Bug",
        variant: "bug",
    },
};

export const WithRemove: Story = {
    args: {
        label: "Bug",
        variant: "bug",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const Maintenance: Story = {
    args: {
        label: "Mantenimiento",
        variant: "maintenance",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const Feature: Story = {
    args: {
        label: "Feature",
        variant: "feature",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const Urgent: Story = {
    args: {
        label: "Urgente",
        variant: "urgent",
        onRemove: (label) => console.log("Removed:", label),
    },
};

// Custom color override — for dynamic label colors from the API
export const CustomColor: Story = {
    args: {
        label: "Custom",
        color: "#ffffff",
        backgroundColor: "#80B918",
        onRemove: (label) => console.log("Removed:", label),
    },
};

// Static chip (no remove button) — read-only display use case
export const ReadOnly: Story = {
    args: {
        label: "Bug",
        variant: "bug",
    },
};