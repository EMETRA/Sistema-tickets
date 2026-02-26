import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Title } from "./index";

const meta: Meta<typeof Title> = {
    title: "Components/Client/Atoms/Title",
    component: Title,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    argTypes: {
    variant: {
        control: { type: "select" },
        options: ["xlarge", "large", "mid"],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const XLarge: Story = { args: { variant: "xlarge", children: "Sistema de tickets EMETRA", tag: "h1" } };
export const Large: Story = { args: { variant: "large", children: "Iniciar Sesión", tag: "h2" } };
export const Mid: Story = { args: { variant: "mid", children: "Reporte de rendimiento", tag: "h3" } };