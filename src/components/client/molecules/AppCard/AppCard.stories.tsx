import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppCard } from "./AppCard";

const meta: Meta<typeof AppCard> = {
    title: "Molecules/AppCard",
    component: AppCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        icon: {
            control: "text",
            description: "Nombre del icono para el AppIcon",
        },
        iconLabel: {
            control: "text",
            description: "Label del icono",
        },
        title: {
            control: "text",
            description: "Título principal de la card",
        },
        bookmarked: {
            control: "boolean",
            description: "Si el bookmark está activo (color amarillo)",
        },
        iconColor: {
            control: "color",
            description: "Color del icono (opcional)",
        },
    },
};

export default meta;
type Story = StoryObj<typeof AppCard>;

export const Default: Story = {
    args: {
        icon: "ticket-solid",
        iconLabel: "Emetra",
        iconColor: "#AACC00",
        title: "Sistema de tickets",
        bookmarked: false,
    },
};

export const Bookmarked: Story = {
    args: {
        icon: "ticket-solid",
        iconLabel: "Emetra",
        iconColor: "#AACC00",
        title: "Sistema de tickets",
        bookmarked: true,
    },
};

export const DashboardApp: Story = {
    args: {
        icon: "home",
        iconLabel: "Dashboard",
        title: "Panel de control",
        bookmarked: false,
    },
};
