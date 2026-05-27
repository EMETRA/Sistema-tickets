import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusCard } from "./StatusCard";

const meta = {
    title: "Molecules/StatusCard",
    component: StatusCard,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        label: {
            control: "text",
            description: "Etiqueta del estado",
        },
        value: {
            control: "number",
            description: "Valor numérico a mostrar",
        },
        variant: {
            control: "select",
            options: ["green", "yellow", "red"],
            description: "Variante de color del estado",
        },
    },
} satisfies Meta<typeof StatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Green: Story = {
    args: {
        label: "Verde",
        value: 55,
        variant: "green",
    },
};

export const Yellow: Story = {
    args: {
        label: "Amarillo",
        value: 17,
        variant: "yellow",
    },
};

export const Red: Story = {
    args: {
        label: "Rojo",
        value: 30,
        variant: "red",
    },
};

export const AllVariants: Story = {
    args: {
        label: "",
        value: 0,
        variant: "green",
    },
    render: () => (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            <StatusCard label="Verde" value={55} variant="green" />
            <StatusCard label="Amarillo" value={17} variant="yellow" />
            <StatusCard label="Rojo" value={30} variant="red" />
        </div>
    ),
};

export const ZeroValue: Story = {
    args: {
        label: "Sin incidencias",
        value: 0,
        variant: "green",
    },
};

export const HighValue: Story = {
    args: {
        label: "Crítico",
        value: 99,
        variant: "red",
    },
};