import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./index";

const meta: Meta<typeof Avatar> = {
    title: "Components/Client/Atoms/Avatar", // Jerarquía de tu proyecto
    component: Avatar,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        size: {
        control: { type: "select" },
        options: ["sm", "md", "lg"],
        },
        status: {
        control: { type: "select" },
        options: ["online", "offline", "busy"],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
    args: {
        initials: "G",
        size: "lg",
        ringed: true,
    },
};

export const WithImage: Story = {
    args: {
        src: "/images/image.png",
        size: "lg",
        ringed: false,
    },
};

export const WithStatus: Story = {
    args: {
        initials: "F",
        size: "md",
        status: "online",
        ringed: true,
    },
};

export const Small: Story = {
    args: {
        initials: "M",
        size: "sm",
        status: "busy",
    },
};

export const GildderFull: Story = {
    args: {
        src: "/images/image.png",
        size: "lg",
        ringed: true,
        status: "online",
    },
};