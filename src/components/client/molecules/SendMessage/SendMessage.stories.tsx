import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SendMessage } from "./index";

const meta: Meta<typeof SendMessage> = {
    title: "Molecules/SendMessage",
    component: SendMessage,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default — empty input ready to type
export const Default: Story = {
    args: {
        placeholder: "Escribe aquí",
        onSend: async (message, files) => {
            console.log("Sent:", { message, files });
        },
    },
};

// Disabled — e.g. while ticket is closed
export const Disabled: Story = {
    args: {
        placeholder: "Escribe aquí",
        disabled: true,
        onSend: async () => {},
    },
};

// Custom placeholder
export const CustomPlaceholder: Story = {
    args: {
        placeholder: "Escribe tu respuesta...",
        onSend: async (message, files) => {
            console.log("Sent:", { message, files });
        },
    },
};