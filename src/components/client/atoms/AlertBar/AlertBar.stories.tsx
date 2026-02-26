import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertBar } from "./index";

const meta: Meta<typeof AlertBar> = {
    title: "Components/Client/Atoms/AlertBar",
    component: AlertBar,
    tags: ["autodocs"],
    // Decorador para darle un ancho fijo en Storybook se vea como en la página
    decorators: [(Story) => <div style={{ width: '300px', padding: '20px' }}><Story /></div>],
    argTypes: {
        color: { control: 'color' },
        duration: { control: { type: 'number', min: 0.5, max: 60, step: 0.5 } }
    }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Caso 1: Carga rápida por defecto
export const FastLoad: Story = {
    args: {
        duration: 2, // 2 segundos
    },
};

// Caso 2: Alerta de error (Rojo, más lento)
export const ErrorTimeout: Story = {
    args: {
        duration: 5,
        color: "#F44336", // Rojo alerta
    },
};

// Caso 3: Éxito (Verde, rápido)
export const SuccessQuick: Story = {
    args: {
        duration: 1.5,
        color: "#4CAF50", // Verde éxito
    },
};