import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusChip } from "./StatusChip";

const meta = {
    title: "Atoms/StatusChip",
    component: StatusChip,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["verde", "amarillo", "rojo"],
            description: "Variante de color del estado",
        },
    },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verde: Story = {
    args: {
        variant: "verde",
    },
};

export const Amarillo: Story = {
    args: {
        variant: "amarillo",
    },
};

export const Rojo: Story = {
    args: {
        variant: "rojo",
    },
};

export const AllVariants: Story = {
    args: {
        variant: "verde",
    },
    render: () => (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <StatusChip variant="verde" />
            <StatusChip variant="amarillo" />
            <StatusChip variant="rojo" />
        </div>
    ),
};