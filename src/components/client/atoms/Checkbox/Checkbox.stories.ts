import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: ["default", "error", "disabled"],
      description: "Estado visual del checkbox",
    },
    label: {
      control: "text",
      description: "Texto del label",
    },
    checked: {
      control: "boolean",
      description: "Si el checkbox está marcado",
    },
    errorMessage: {
      control: "text",
      description: "Mensaje de error (solo visible cuando state='error')",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Checkbox default sin marcar
export const Default: Story = {
  args: {
    label: "Acepto los términos y condiciones",
    state: "default",
  },
};

// Checkbox marcado
export const Checked: Story = {
  args: {
    label: "Acepto los términos y condiciones",
    state: "default",
    defaultChecked: true,
  },
};

// Checkbox sin label
export const WithoutLabel: Story = {
  args: {
    state: "default",
  },
};

// Checkbox sin label marcado
export const WithoutLabelChecked: Story = {
  args: {
    state: "default",
    defaultChecked: true,
  },
};

// Checkbox con error
export const WithError: Story = {
  args: {
    label: "Debes aceptar los términos",
    state: "error",
    errorMessage: "Este campo es requerido",
  },
};

// Checkbox con error marcado
export const WithErrorChecked: Story = {
  args: {
    label: "Debes aceptar los términos",
    state: "error",
    errorMessage: "Este campo es requerido",
    defaultChecked: true,
  },
};

// Checkbox deshabilitado
export const Disabled: Story = {
  args: {
    label: "Opción deshabilitada",
    state: "disabled",
  },
};

// Checkbox deshabilitado y marcado
export const DisabledChecked: Story = {
  args: {
    label: "Opción deshabilitada",
    state: "disabled",
    defaultChecked: true,
  },
};

// Checkbox con label largo
export const LongLabel: Story = {
  args: {
    label: "Acepto los términos y condiciones de uso, la política de privacidad y el tratamiento de datos personales",
    state: "default",
  },
};
