import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LabelChipGroup } from "./index";
import type { LabelOption } from "./types";

const meta: Meta<typeof LabelChipGroup> = {
    title: "Molecules/LabelChipGroup",
    component: LabelChipGroup,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ALL_OPTIONS: LabelOption[] = [
    { value: "bug", label: "Bug", color: "#ffffff", backgroundColor: "#e53935" },
    { value: "maintenance", label: "Mantenimiento", color: "#ffffff", backgroundColor: "#FB8C00" },
    { value: "feature", label: "Feature", color: "#ffffff", backgroundColor: "#43A047" },
    { value: "urgent", label: "Urgente", color: "#ffffff", backgroundColor: "#E53935" },
];

const INITIAL_LABELS: LabelOption[] = [
    { value: "bug", label: "Bug", color: "#ffffff", backgroundColor: "#e53935" },
    { value: "maintenance", label: "Mantenimiento", color: "#ffffff", backgroundColor: "#FB8C00" },
];

export const UserReadonly: Story = {
    args: {
        role: "USUARIO",
        labels: INITIAL_LABELS,
        availableOptions: ALL_OPTIONS,
    },
};

export const UserReadonlyEmpty: Story = {
    args: {
        role: "USUARIO",
        labels: [],
        availableOptions: ALL_OPTIONS,
    },
};

export const TechEditable: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>(INITIAL_LABELS);
        return (
            <LabelChipGroup
                role="TECNICO"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};

export const TechEditableEmpty: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>([]);
        return (
            <LabelChipGroup
                role="TECNICO"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};

export const AdminEditable: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>(INITIAL_LABELS);
        return (
            <LabelChipGroup
                role="ADMINISTRADOR"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};

export const AllLabelsSelected: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>(ALL_OPTIONS);
        return (
            <LabelChipGroup
                role="TECNICO"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};