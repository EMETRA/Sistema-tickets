import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Switch } from "./";

const meta = {
  title: "Atoms/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: ["default", "error", "disabled"],
      description: "Estado visual del switch",
    },
    label: {
      control: "text",
      description: "Texto del label",
    },
    checked: {
      control: "boolean",
      description: "Si el switch está activado",
    },
    errorMessage: {
      control: "text",
      description: "Mensaje de error (solo visible cuando state='error')",
    },
    switchSize: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Tamaño del switch",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Switch default desactivado
export const Default: Story = {
  args: {
    label: "Activar notificaciones",
    state: "default",
  },
};

// Switch activado
export const Checked: Story = {
  args: {
    label: "Activar notificaciones",
    state: "default",
    defaultChecked: true,
  },
};

// Switch sin label
export const WithoutLabel: Story = {
  args: {
    state: "default",
  },
};

// Switch sin label activado
export const WithoutLabelChecked: Story = {
  args: {
    state: "default",
    defaultChecked: true,
  },
};

// Switch con error
export const WithError: Story = {
  args: {
    label: "Debes activar esta opción",
    state: "error",
    errorMessage: "Este campo es requerido",
  },
};

// Switch con error activado
export const WithErrorChecked: Story = {
  args: {
    label: "Debes activar esta opción",
    state: "error",
    errorMessage: "Este campo es requerido",
    defaultChecked: true,
  },
};

// Switch deshabilitado
export const Disabled: Story = {
  args: {
    label: "Opción deshabilitada",
    state: "disabled",
  },
};

// Switch deshabilitado y activado
export const DisabledChecked: Story = {
  args: {
    label: "Opción deshabilitada",
    state: "disabled",
    defaultChecked: true,
  },
};

// Switch con label largo
export const LongLabel: Story = {
  args: {
    label: "Activar todas las notificaciones por correo electrónico, SMS y notificaciones push",
    state: "default",
  },
};

// Switch pequeño
export const Small: Story = {
  args: {
    label: "Switch pequeño",
    state: "default",
    switchSize: "small",
  },
};

// Switch pequeño activado
export const SmallChecked: Story = {
  args: {
    label: "Switch pequeño",
    state: "default",
    switchSize: "small",
    defaultChecked: true,
  },
};

// Switch mediano (default)
export const Medium: Story = {
  args: {
    label: "Switch mediano (default)",
    state: "default",
    switchSize: "medium",
  },
};

// Switch mediano activado
export const MediumChecked: Story = {
  args: {
    label: "Switch mediano (default)",
    state: "default",
    switchSize: "medium",
    defaultChecked: true,
  },
};

// Switch grande
export const Large: Story = {
  args: {
    label: "Switch grande",
    state: "default",
    switchSize: "large",
  },
};

// Switch grande activado
export const LargeChecked: Story = {
  args: {
    label: "Switch grande",
    state: "default",
    switchSize: "large",
    defaultChecked: true,
  },
};
