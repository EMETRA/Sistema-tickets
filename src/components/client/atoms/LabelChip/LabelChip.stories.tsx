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

export const Default: Story = {
    args: {
        label: "Bug",
        color: "#ffffff",
        backgroundColor: "#e53935",
    },
};

export const WithRemove: Story = {
    args: {
        label: "Bug",
        color: "#ffffff",
        backgroundColor: "#e53935",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const Maintenance: Story = {
    args: {
        label: "Mantenimiento",
        color: "#ffffff",
        backgroundColor: "#FB8C00",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const Feature: Story = {
    args: {
        label: "Feature",
        color: "#ffffff",
        backgroundColor: "#43A047",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const Urgent: Story = {
    args: {
        label: "Urgente",
        color: "#ffffff",
        backgroundColor: "#E53935",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const CustomColor: Story = {
    args: {
        label: "Custom",
        color: "#ffffff",
        backgroundColor: "#80B918",
        onRemove: (label) => console.log("Removed:", label),
    },
};

export const ReadOnly: Story = {
    args: {
        label: "Bug",
        color: "#ffffff",
        backgroundColor: "#e53935",
    },
};