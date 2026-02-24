import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "./index";

const meta: Meta<typeof Icon> = {
  title: "Components/Server/Atoms/Icon",
  component: Icon,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Ejemplo de icono en el Sidebar
export const NavigationItem: Story = {
  parameters: { 
    backgrounds: { default: 'dark' } // Esto pondrá el fondo gris oscuro en Storybook
  },
  args: {
    name: "home", // Asegúrate de que home.svg esté en tu carpeta public
    variant: "navigation",
    active: false,
    size: 24,
  },
};

// Ejemplo de icono interactivo
export const ActionSettings: Story = {
  args: {
    name: "settings",
    variant: "action",
    size: 24,
  },
};

// Ejemplo de icono informativo en tablas
export const StatusInfo: Story = {
  args: {
    name: "file",
    variant: "status",
    size: 20,
  },
};