import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./index";

const meta: Meta<typeof Avatar> = {
    title: "Components/Server/Atoms/Avatar", // Jerarquía de tu proyecto
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

// 1. Avatar con Iniciales (Como se ve en el Dashboard de EMETRA)
export const Initials: Story = {
    args: {
        initials: "G",
        size: "lg",
        ringed: true,
    },
};

// 2. Avatar con Imagen Local
export const WithImage: Story = {
    args: {
        src: "/images/image.png", // Usando la ruta de tu captura de pantalla
        size: "lg",
        ringed: false,
    },
};

// 3. Avatar con Punto de Notificación (Online)
export const WithStatus: Story = {
    args: {
        initials: "F",
        size: "md",
        status: "online",
        ringed: true,
    },
};

// 4. Variante Pequeña (Para barras laterales o tablas)
export const Small: Story = {
    args: {
        initials: "M",
        size: "sm",
        status: "busy",
    },
};

// 5. Ejemplo completo: Gildder Caceres
export const GildderFull: Story = {
    args: {
        src: "/images/image.png", //
        size: "lg",
        ringed: true,
        status: "online",
    },
};