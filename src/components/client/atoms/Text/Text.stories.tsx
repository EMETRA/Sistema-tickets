import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text } from "./index";

const meta: Meta<typeof Text> = {
    title: "Components/Server/Atoms/Text",
    component: Text,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = { args: { variant: "body", children: "Texto estándar del portal." } };
export const Muted: Story = { args: { variant: "muted", children: "Bienvenido ingresa tus credenciales para acceder" } };
export const Caption: Story = { args: { variant: "caption", children: "Última actualización: hace 5 minutos" } };
export const Overline: Story = { args: { variant: "overline", children: "CONFIG SISTEMA" } };