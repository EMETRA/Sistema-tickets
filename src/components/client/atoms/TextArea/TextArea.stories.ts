import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextArea } from "./";

const meta = {
  title: "Atoms/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: ["default", "focus", "error", "disabled"],
      description: "Estado visual del textarea",
    },
    placeholder: {
      control: "text",
      description: "Texto placeholder",
    },
    errorMessage: {
      control: "text",
      description: "Mensaje de error (solo visible cuando state='error')",
    },
    rows: {
      control: "number",
      description: "Número de filas visibles",
    },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// TextArea default
export const Default: Story = {
  args: {
    placeholder: "Escribe tu mensaje aquí...",
    state: "default",
    rows: 4,
  },
};

// TextArea con contenido
export const WithContent: Story = {
  args: {
    placeholder: "Escribe tu mensaje aquí...",
    state: "default",
    rows: 4,
    defaultValue: "Este es un ejemplo de texto\ncon múltiples líneas\nen el textarea.",
  },
};

// TextArea con error
export const WithError: Story = {
  args: {
    placeholder: "Escribe tu mensaje aquí...",
    state: "error",
    errorMessage: "Este campo es requerido",
    rows: 4,
  },
};

// TextArea deshabilitado
export const Disabled: Story = {
  args: {
    placeholder: "TextArea deshabilitado",
    state: "disabled",
    rows: 4,
    defaultValue: "Este textarea está deshabilitado",
  },
};

// TextArea con muchas filas
export const LargeTextArea: Story = {
  args: {
    placeholder: "Escribe un texto largo...",
    state: "default",
    rows: 10,
  },
};
