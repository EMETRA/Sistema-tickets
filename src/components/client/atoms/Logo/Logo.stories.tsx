import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "./index";

const meta: Meta<typeof Logo> = {
    title: "Components/Server/Atoms/Logo", // Siguiendo la jerarquía de tu proyecto
    component: Logo,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        name: {
        control: { type: "select" },
        options: ["Emetra"],
        description: "Nombre del logo a renderizar",
        },
        width: {
        control: { type: "number" },
        description: "Ancho del logo en píxeles",
        },
        height: {
        control: { type: "number" },
        description: "Alto del logo en píxeles",
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        name: "EmetraMain",
        width: 200,
        height: 60,
    },
};

export const Small: Story = {
    args: {
        name: "EmetraMain",
        width: 100,
        height: 30,
    },
};

// Historia para ver cómo se comporta con diferentes tamaños
export const SizeComparison: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
        <div>
            <p style={{ fontSize: "12px", fontFamily: "Arial, sans-serif", color: "gray", marginBottom: "8px" }}>Large (Default)</p>
            <Logo name="EmetraMain" width={250} />
        </div>
        <div>
            <p style={{ fontSize: "12px", fontFamily: "Arial, sans-serif", color: "gray", marginBottom: "8px" }}>Medium</p>
            <Logo name="EmetraMain" width={150} />
        </div>
        <div>
            <p style={{ fontSize: "12px", fontFamily: "Arial, sans-serif", color: "gray", marginBottom: "8px" }}>Small</p>
            <Logo name="EmetraMain" width={80} />
        </div>
        </div>
    ),
};