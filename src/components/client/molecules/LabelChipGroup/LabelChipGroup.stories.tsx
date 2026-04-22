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
    { value: "bug", label: "Bug", variant: "bug" },
    { value: "maintenance", label: "Mantenimiento", variant: "maintenance" },
    { value: "feature", label: "Feature", variant: "feature" },
    { value: "urgent", label: "Urgente", variant: "urgent" },
];

const INITIAL_LABELS: LabelOption[] = [
    { value: "bug", label: "Bug", variant: "bug" },
    { value: "maintenance", label: "Mantenimiento", variant: "maintenance" },
];

// Read-only — user role can only see labels
export const UserReadonly: Story = {
    args: {
        role: "user",
        labels: INITIAL_LABELS,
        availableOptions: ALL_OPTIONS,
    },
};

// Read-only with no labels assigned
export const UserReadonlyEmpty: Story = {
    args: {
        role: "user",
        labels: [],
        availableOptions: ALL_OPTIONS,
    },
};

// Editable — tech/admin can add and remove
export const TechEditable: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>(INITIAL_LABELS);
        return (
            <LabelChipGroup
                role="tech"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};

// Editable starting empty
export const TechEditableEmpty: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>([]);
        return (
            <LabelChipGroup
                role="tech"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};

// Admin — same editing rights as tech
export const AdminEditable: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>(INITIAL_LABELS);
        return (
            <LabelChipGroup
                role="admin"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};

// All options already selected — add dropdown disappears
export const AllLabelsSelected: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>(ALL_OPTIONS);
        return (
            <LabelChipGroup
                role="tech"
                labels={labels}
                availableOptions={ALL_OPTIONS}
                onChange={setLabels}
            />
        );
    },
};