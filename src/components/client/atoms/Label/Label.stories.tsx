import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
    title: "Components/Server/Atoms/Label",
    component: Label,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { 
    args: { 
    children: "Usuario", 
    htmlFor: "usuario-input" 
} 
};