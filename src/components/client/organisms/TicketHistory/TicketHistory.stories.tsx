import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketHistory } from "./index";
import type { LabelOption, HistoryItem } from "./types";

const meta: Meta<typeof TicketHistory> = {
    title: "Organisms/TicketHistory",
    component: TicketHistory,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const AVAILABLE_OPTIONS: LabelOption[] = [
    { value: "bug", label: "Bug", variant: "bug" },
    { value: "maintenance", label: "Mantenimiento", variant: "maintenance" },
    { value: "feature", label: "Feature", variant: "feature" },
    { value: "urgent", label: "Urgente", variant: "urgent" },
];

const SAMPLE_HISTORY: HistoryItem[] = [
    {
        user: "Roger Herrera",
        ticketId: "00001",
        timestamp: "2026-03-20T10:00:00Z",
        action: "CREATED",
        ticketStatus: "espera",
    },
    {
        user: "Gerardo Zamora",
        ticketId: "00001",
        timestamp: "2026-03-22T10:00:00Z",
        action: "ASSIGNED",
        assignedTo: "Feyser Caceres",
    },
    {
        user: "Feyser Caceres",
        ticketId: "00001",
        timestamp: new Date().toISOString(),
        action: "TAGGED",
        tag: "Bug",
    },
    {
        user: "Feyser Caceres",
        ticketId: "00001",
        timestamp: new Date().toISOString(),
        action: "TAGGED",
        tag: "Mantenimiento",
    },
];

// User role — read-only labels, full history
export const UserView: Story = {
    args: {
        ticketId: "00001",
        role: "user",
        labels: [
            { value: "bug", label: "Bug", variant: "bug" },
            { value: "maintenance", label: "Mantenimiento", variant: "maintenance" },
        ],
        availableOptions: AVAILABLE_OPTIONS,
        historyItems: SAMPLE_HISTORY,
    },
};

// Tech role — editable labels
export const TechView: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>([
            { value: "bug", label: "Bug", variant: "bug" },
            { value: "maintenance", label: "Mantenimiento", variant: "maintenance" },
        ]);

        return (
            <TicketHistory
                ticketId="00001"
                role="tech"
                labels={labels}
                availableOptions={AVAILABLE_OPTIONS}
                historyItems={SAMPLE_HISTORY}
                onLabelsChange={setLabels}
            />
        );
    },
};

// Admin role — same editing rights as tech
export const AdminView: Story = {
    render: () => {
        const [labels, setLabels] = useState<LabelOption[]>([
            { value: "bug", label: "Bug", variant: "bug" },
        ]);

        return (
            <TicketHistory
                ticketId="00001"
                role="admin"
                labels={labels}
                availableOptions={AVAILABLE_OPTIONS}
                historyItems={SAMPLE_HISTORY}
                onLabelsChange={setLabels}
            />
        );
    },
};

// Empty labels — no labels assigned yet
export const NoLabels: Story = {
    args: {
        ticketId: "00001",
        role: "user",
        labels: [],
        availableOptions: AVAILABLE_OPTIONS,
        historyItems: SAMPLE_HISTORY,
    },
};