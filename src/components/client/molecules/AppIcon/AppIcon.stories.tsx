import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppIcon } from "./AppIcon";

const meta: Meta<typeof AppIcon> = {
    title: "Molecules/AppIcon",
    component: AppIcon,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        icon: {
            control: "text",
            description: "Nombre del icono a mostrar",
        },
        label: {
            control: "text",
            description: "Texto del label debajo del icono",
        },
        size: {
            control: { type: "number", min: 16, max: 48 },
            description: "Tamaño del icono en píxeles",
        },
    },
};

export default meta;
type Story = StoryObj<typeof AppIcon>;

export const Default: Story = {
    args: {
        icon: "users-solid",
        label: "Usuario",
        size: 24,
    },
};

export const Emetra: Story = {
    args: {
        icon: "ticket-solid",
        label: "Emetra",
        size: 24,
        color: "#AACC00",
    },
};

export const MTD: Story = {
    args: {
        icon: "bus-side-solid",
        label: "MTD",
        size: 24,
        color: "#007ACC",
    },
};
