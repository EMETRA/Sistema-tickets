import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconFilterTabs } from "./IconFilterTabs";
import { useState } from "react";

const meta = {
    title: "Molecules/IconFilterTabs",
    component: IconFilterTabs,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        value: {
            control: "text",
            description: "Valor del filtro seleccionado",
        },
        disabled: {
            control: "boolean",
            description: "Si el componente está deshabilitado",
        },
    },
} satisfies Meta<typeof IconFilterTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado predeterminado con "Todos" seleccionado
 */
export const Default: Story = {
    args: {
        options: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
        ],
        value: "all",
        onChange: (value) => console.log("Filter changed:", value),
    },
};

/**
 * Con filtro "Asignados" seleccionado
 */
export const AssignedSelected: Story = {
    args: {
        options: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
        ],
        value: "assigned",
        onChange: (value) => console.log("Filter changed:", value),
    },
};

/**
 * Con múltiples opciones
 */
export const MultipleOptions: Story = {
    args: {
        options: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
            { label: "Completados", value: "completed", icon: "check-slot-solid-full" },
        ],
        value: "all",
        onChange: (value) => console.log("Filter changed:", value),
    },
};

/**
 * Estado deshabilitado
 */
export const Disabled: Story = {
    args: {
        options: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
        ],
        value: "all",
        disabled: true,
        onChange: (value) => console.log("Filter changed:", value),
    },
};

/**
 * Componente interactivo
 */
export const Interactive = {
    render: () => {
        const [selectedFilter, setSelectedFilter] = useState("all");

        return (
            <div>
                <IconFilterTabs
                    options={[
                        { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
                        { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
                    ]}
                    value={selectedFilter}
                    onChange={setSelectedFilter}
                />
                <div style={{ marginTop: "20px", padding: "10px", background: "#f5f5f5" }}>
                    <p>Filtro seleccionado: <strong>{selectedFilter}</strong></p>
                </div>
            </div>
        );
    },
};

/**
 * Solo con "Todos" (sin opciones adicionales)
 */
export const OnlyAll: Story = {
    args: {
        options: [],
        value: "all",
        onChange: (value) => console.log("Filter changed:", value),
    },
};
