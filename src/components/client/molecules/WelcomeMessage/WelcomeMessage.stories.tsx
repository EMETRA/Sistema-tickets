import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WelcomeMessage } from "./WelcomeMessage";

const meta: Meta<typeof WelcomeMessage> = {
    title: "Molecules/WelcomeMessage",
    component: WelcomeMessage,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        userName: {
            control: "text",
        }
    },
};

export default meta;
type Story = StoryObj<typeof WelcomeMessage>;

export const Default: Story = {
    args: {
        userName: "Juan Pérez",
    },
};
