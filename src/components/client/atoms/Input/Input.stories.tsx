import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./";
import { Icon } from "../Icon";

const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "file"],
      description: "Tipo de input",
    },
    state: {
      control: "select",
      options: ["default", "focus", "error", "disabled"],
      description: "Estado visual del input",
    },
    placeholder: {
      control: "text",
      description: "Texto placeholder",
    },
    errorMessage: {
      control: "text",
      description: "Mensaje de error (solo visible cuando state='error')",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Input tipo Text
export const Text: Story = {
  args: {
    type: "text",
    placeholder: "Escribe algo...",
    state: "default",
  },
};

export const TextWithError: Story = {
  args: {
    type: "text",
    placeholder: "Escribe algo...",
    state: "error",
    errorMessage: "Este campo es requerido",
  },
};

export const TextDisabled: Story = {
  args: {
    type: "text",
    placeholder: "Input deshabilitado",
    state: "disabled",
  },
};

// Input tipo Password
export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Ingresa tu contraseña",
    state: "default",
  },
};

export const PasswordWithError: Story = {
  args: {
    type: "password",
    placeholder: "Ingresa tu contraseña",
    state: "error",
    errorMessage: "La contraseña debe tener al menos 8 caracteres",
  },
};

export const PasswordDisabled: Story = {
  args: {
    type: "password",
    placeholder: "Contraseña deshabilitada",
    state: "disabled",
  },
};

// Input tipo File
export const File: Story = {
  args: {
    type: "file",
    state: "default",
  },
};

export const FileWithError: Story = {
  args: {
    type: "file",
    state: "error",
    errorMessage: "El archivo es demasiado grande",
  },
};

export const FileDisabled: Story = {
  args: {
    type: "file",
    state: "disabled",
  },
};

// ============================================
// INPUT CON ICONOS PERSONALIZADOS
// ============================================

export const TextWithIconRight: Story = {
  args: {
    type: "text",
    placeholder: "Buscar usuario...",
    state: "default",
    icon: <Icon name="users" variant="action" size={20} />,
  },
};

export const TextWithIconLeft: Story = {
  args: {
    type: "text",
    placeholder: "Página de inicio...",
    state: "default",
    icon: <Icon name="home" variant="action" size={20} />,
    showIconLeft: true,
  },
};

export const TextWithIconError: Story = {
  args: {
    type: "text",
    placeholder: "Buscar tickets...",
    state: "error",
    errorMessage: "No se encontraron tickets",
    icon: <Icon name="ticket" variant="action" size={20} />,
  },
};

export const TextWithIconDisabled: Story = {
  args: {
    type: "text",
    placeholder: "Deshabilitado con icono",
    state: "disabled",
    icon: <Icon name="settings" variant="action" size={20} />,
  },
};
