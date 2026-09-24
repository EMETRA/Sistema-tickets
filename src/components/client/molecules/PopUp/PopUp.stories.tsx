import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PopUp } from "./index";

const meta: Meta<typeof PopUp> = {
    title: "Molecules/PopUp",
    component: PopUp,
    argTypes: {
        isOpen: {
            control: { type: "boolean" },
            description: "Controla la visibilidad del pop up",
        },
        variant: {
            control: { type: "select" },
            options: ["default", "success", "warning", "error"],
            description: "Variante del pop up",
        },
        title: {
            control: { type: "text" },
            description: "Título del pop up",
        },
        description: {
            control: { type: "text" },
            description: "Descripción del pop up",
        },
        actions: {
            control: { type: "object" },
            description: "Acciones del pop up",
        },
        onClose: {
            action: "close",
            description: "Cierra el pop up",
        },
    },
};

export default meta;

export const Default: StoryObj<typeof PopUp> = {
    args: {
        isOpen: true,
        variant: "default",
        title: "Título del pop up",
        description: "Descripción del pop up",
        actions: [
            {
                text: "Acción 1",
                color: "success",
                onClick: () => {},
            },
            {
                text: "Acción 2",
                color: "danger",
                onClick: () => {},
            },
        ],
        onClose: () => {},
    },
};

export const Success: StoryObj<typeof PopUp> = {
    args: {
        isOpen: true,
        variant: "success",
        title: "Título del pop up",
        description: "Descripción del pop up",
        onClose: () => {},
    },
};

export const Warning: StoryObj<typeof PopUp> = {
    args: {
        isOpen: true,
        variant: "warning",
        title: "Título del pop up",
        description: "Descripción del pop up",
        onClose: () => {},
    },
};

export const Error: StoryObj<typeof PopUp> = {
    args: {
        isOpen: true,
        variant: "error",
        title: "Título del pop up",
        description: "Descripción del pop up",
        onClose: () => {},
    },
};
