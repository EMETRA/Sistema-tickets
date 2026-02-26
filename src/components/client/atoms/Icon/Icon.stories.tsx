import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "./index";

const meta: Meta<typeof Icon> = {
  title: "Components/Client/Atoms/Icon",
  component: Icon,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NavigationItem: Story = {
  parameters: { 
    backgrounds: { default: 'dark' } 
  },
  args: {
    name: "home",
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