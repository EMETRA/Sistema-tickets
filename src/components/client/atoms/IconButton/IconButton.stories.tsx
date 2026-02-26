import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconButton } from "./";

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: ["home", "users", "ticket", "settings", "bell", "logout", "eye", "eye-off", "file"],
      description: "Nombre del icono a mostrar",
    },
    size: {
      control: { type: "number", min: 16, max: 64, step: 4 },
      description: "Tamaño del icono en píxeles",
    },
    disabled: {
      control: "boolean",
      description: "Estado deshabilitado del botón",
    },
    loading: {
      control: "boolean",
      description: "Estado de carga del botón",
    },
    onClick: {
      description: "Función a ejecutar al hacer clic",
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado por defecto del IconButton
 */
export const Default: Story = {
  args: {
    icon: "settings",
    size: 24,
  },
};

/**
 * IconButton con icono de home
 */
export const Home: Story = {
  args: {
    icon: "home",
    size: 24,
  },
};

/**
 * IconButton con icono de usuarios
 */
export const Users: Story = {
  args: {
    icon: "users",
    size: 24,
  },
};

/**
 * IconButton con icono de ticket
 */
export const Ticket: Story = {
  args: {
    icon: "ticket",
    size: 24,
  },
};

/**
 * IconButton con icono de campana
 */
export const Bell: Story = {
  args: {
    icon: "bell",
    size: 24,
  },
};

/**
 * IconButton con icono de logout
 */
export const Logout: Story = {
  args: {
    icon: "logout",
    size: 24,
  },
};

/**
 * IconButton con tamaño pequeño (16px)
 */
export const Small: Story = {
  args: {
    icon: "settings",
    size: 16,
  },
};

/**
 * IconButton con tamaño grande (32px)
 */
export const Large: Story = {
  args: {
    icon: "settings",
    size: 32,
  },
};

/**
 * IconButton con tamaño extra grande (48px)
 */
export const ExtraLarge: Story = {
  args: {
    icon: "settings",
    size: 48,
  },
};

/**
 * IconButton en estado deshabilitado
 */
export const Disabled: Story = {
  args: {
    icon: "settings",
    size: 24,
    disabled: true,
  },
};

export const Borderless: Story = {
  args: {
    icon: "settings",
    size: 24,
    borderless: true,
  },
};
