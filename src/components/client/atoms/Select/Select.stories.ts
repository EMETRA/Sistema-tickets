import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Select } from "./";

const meta = {
  title: "Atoms/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: ["default", "error", "disabled"],
      description: "Estado visual del select",
    },
    placeholder: {
      control: "text",
      description: "Texto placeholder cuando no hay opción seleccionada",
    },
    errorMessage: {
      control: "text",
      description: "Mensaje de error (solo visible cuando state='error')",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Select default con placeholder
export const Default: Story = {
  args: {
    placeholder: "Selecciona una opción",
    state: "default",
    options: [
      { value: "1", label: "Opción 1" },
      { value: "2", label: "Opción 2" },
      { value: "3", label: "Opción 3" },
    ],
  },
};

// Select sin placeholder (primera opción visible)
export const WithoutPlaceholder: Story = {
  args: {
    state: "default",
    options: [
      { value: "1", label: "Opción 1" },
      { value: "2", label: "Opción 2" },
      { value: "3", label: "Opción 3" },
    ],
  },
};

// Select con valor preseleccionado
export const WithValue: Story = {
  args: {
    placeholder: "Selecciona una opción",
    state: "default",
    defaultValue: "2",
    options: [
      { value: "1", label: "Opción 1" },
      { value: "2", label: "Opción 2" },
      { value: "3", label: "Opción 3" },
    ],
  },
};

// Select con error
export const WithError: Story = {
  args: {
    placeholder: "Selecciona una opción",
    state: "error",
    errorMessage: "Debes seleccionar una opción",
    options: [
      { value: "1", label: "Opción 1" },
      { value: "2", label: "Opción 2" },
      { value: "3", label: "Opción 3" },
    ],
  },
};

// Select deshabilitado
export const Disabled: Story = {
  args: {
    placeholder: "Selecciona una opción",
    state: "disabled",
    options: [
      { value: "1", label: "Opción 1" },
      { value: "2", label: "Opción 2" },
      { value: "3", label: "Opción 3" },
    ],
  },
};

// Select deshabilitado con valor
export const DisabledWithValue: Story = {
  args: {
    placeholder: "Selecciona una opción",
    state: "disabled",
    defaultValue: "2",
    options: [
      { value: "1", label: "Opción 1" },
      { value: "2", label: "Opción 2" },
      { value: "3", label: "Opción 3" },
    ],
  },
};

// Select con muchas opciones (países)
export const WithManyOptions: Story = {
  args: {
    placeholder: "Selecciona tu país",
    state: "default",
    options: [
      { value: "ar", label: "Argentina" },
      { value: "br", label: "Brasil" },
      { value: "cl", label: "Chile" },
      { value: "co", label: "Colombia" },
      { value: "ec", label: "Ecuador" },
      { value: "es", label: "España" },
      { value: "mx", label: "México" },
      { value: "pe", label: "Perú" },
      { value: "uy", label: "Uruguay" },
      { value: "ve", label: "Venezuela" },
    ],
  },
};

// Select con grupos de opciones
export const WithGroups: Story = {
  args: {
    placeholder: "Selecciona una fruta",
    state: "default",
    options: [
      {
        label: "Frutas",
        options: [
          { value: "manzana", label: "Manzana" },
          { value: "banana", label: "Banana" },
          { value: "naranja", label: "Naranja" },
        ],
      },
      {
        label: "Verduras",
        options: [
          { value: "lechuga", label: "Lechuga" },
          { value: "tomate", label: "Tomate" },
          { value: "zanahoria", label: "Zanahoria" },
        ],
      },
    ],
  },
};
