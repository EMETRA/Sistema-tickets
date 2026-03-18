import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToggleButton } from "./ToggleButton";
import { useState } from "react";

const meta = {
    title: "Atoms/ToggleButton",
    component: ToggleButton,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["primary", "secondary"],
            description: "Variante del toggle button",
        },
        options: {
            description: "Opciones disponibles para el toggle",
        },
        value: {
            control: "text",
            description: "Valor seleccionado actualmente",
        },
        disabled: {
            control: "boolean",
            description: "Si el toggle está deshabilitado",
        },
        maxVisibleOptions: {
            control: "number",
            description: "Número máximo de opciones visibles (con navegación)",
        },
    },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Toggle button variante primary
 */
export const Primary: Story = {
    args: {
        variant: "primary",
        options: [
            { label: "Anual", value: "annual" },
            { label: "Mensual", value: "monthly" },
            { label: "Semanal", value: "weekly" },
            { label: "Hoy", value: "today" },
        ],
        value: "today",
    },
};

/**
 * Toggle button variante secondary
 */
export const Secondary: Story = {
    args: {
        variant: "secondary",
        options: [
            { label: "General", value: "general" },
            { label: "Tesorería", value: "treasury" },
            { label: "Contabilidad", value: "accounting" },
            { label: "Inventario", value: "inventory" },
            { label: "Compras", value: "purchases" },
        ],
        value: "treasury",
    },
};

/**
 * Toggle con navegación (máximo 3 opciones visibles)
 */
export const WithNavigation: Story = {
    args: {
        variant: "secondary",
        options: [
            { label: "RRHH", value: "hr" },
            { label: "Informática", value: "it" },
            { label: "Finanzas", value: "finance" },
            { label: "Administrativa", value: "admin" },
            { label: "General", value: "general" },
            { label: "Ingresos", value: "income" },
            { label: "Auditoría", value: "audit" },
            { label: "PMT", value: "pmt" },
        ],
        value: "finance",
        maxVisibleOptions: 3,
    },
};

/**
 * Toggle con muchas opciones y navegación
 */
export const ManyOptionsWithNavigation: Story = {
    args: {
        variant: "primary",
        options: [
            { label: "Opción 1", value: "opt1" },
            { label: "Opción 2", value: "opt2" },
            { label: "Opción 3", value: "opt3" },
            { label: "Opción 4", value: "opt4" },
            { label: "Opción 5", value: "opt5" },
            { label: "Opción 6", value: "opt6" },
            { label: "Opción 7", value: "opt7" },
            { label: "Opción 8", value: "opt8" },
            { label: "Opción 9", value: "opt9" },
            { label: "Opción 10", value: "opt10" },
        ],
        value: "opt5",
        maxVisibleOptions: 4,
    },
};

/**
 * Toggle deshabilitado
 */
export const Disabled: Story = {
    args: {
        variant: "primary",
        options: [
            { label: "Anual", value: "annual" },
            { label: "Mensual", value: "monthly" },
            { label: "Semanal", value: "weekly" },
            { label: "Hoy", value: "today" },
        ],
        value: "monthly",
        disabled: true,
    },
};

/**
 * Toggle interactivo con estado
 */
export const Interactive = {
    render: () => {
        const [value, setValue] = useState("monthly");

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <h3>Variante Primary</h3>
                    <ToggleButton
                        variant="primary"
                        options={[
                            { label: "Anual", value: "annual" },
                            { label: "Mensual", value: "monthly" },
                            { label: "Semanal", value: "weekly" },
                            { label: "Hoy", value: "today" },
                        ]}
                        value={value}
                        onChange={setValue}
                    />
                    <p>Valor seleccionado: {value}</p>
                </div>
        
                <div>
                    <h3>Variante Secondary</h3>
                    <ToggleButton
                        variant="secondary"
                        options={[
                            { label: "Anual", value: "annual" },
                            { label: "Mensual", value: "monthly" },
                            { label: "Semanal", value: "weekly" },
                            { label: "Hoy", value: "today" },
                        ]}
                        value={value}
                        onChange={setValue}
                    />
                </div>
            </div>
        );
    },
};
