import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToggleButton } from "./";

const meta = {
  title: "Atoms/ToggleButton",
  component: ToggleButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    options: {
      description: "Array de opciones para el toggle button",
    },
    value: {
      control: "text",
      description: "Valor actualmente seleccionado",
    },
    disabled: {
      control: "boolean",
      description: "Si el toggle button está deshabilitado",
    },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// ESTADOS BÁSICOS
// ============================================

export const Default: Story = {
  args: {
    options: [
      { label: "Anual", value: "anual" },
      { label: "Mensual", value: "mensual" },
      { label: "Semanal", value: "semanal" },
      { label: "Hoy", value: "hoy" },
    ],
    value: "hoy",
  },
};

export const FirstSelected: Story = {
  args: {
    options: [
      { label: "Anual", value: "anual" },
      { label: "Mensual", value: "mensual" },
      { label: "Semanal", value: "semanal" },
      { label: "Hoy", value: "hoy" },
    ],
    value: "anual",
  },
};

export const MiddleSelected: Story = {
  args: {
    options: [
      { label: "Anual", value: "anual" },
      { label: "Mensual", value: "mensual" },
      { label: "Semanal", value: "semanal" },
      { label: "Hoy", value: "hoy" },
    ],
    value: "mensual",
  },
};

export const NoSelection: Story = {
  args: {
    options: [
      { label: "Anual", value: "anual" },
      { label: "Mensual", value: "mensual" },
      { label: "Semanal", value: "semanal" },
      { label: "Hoy", value: "hoy" },
    ],
  },
};

export const Disabled: Story = {
  args: {
    options: [
      { label: "Anual", value: "anual" },
      { label: "Mensual", value: "mensual" },
      { label: "Semanal", value: "semanal" },
      { label: "Hoy", value: "hoy" },
    ],
    value: "hoy",
    disabled: true,
  },
};

// ============================================
// CASOS DE USO
// ============================================

export const ThreeOptions: Story = {
  args: {
    options: [
      { label: "Día", value: "dia" },
      { label: "Semana", value: "semana" },
      { label: "Mes", value: "mes" },
    ],
    value: "semana",
  },
};

export const TwoOptions: Story = {
  args: {
    options: [
      { label: "Lista", value: "lista" },
      { label: "Cuadrícula", value: "cuadricula" },
    ],
    value: "lista",
  },
};

export const FiveOptions: Story = {
  args: {
    options: [
      { label: "Todos", value: "todos" },
      { label: "Activos", value: "activos" },
      { label: "Pendientes", value: "pendientes" },
      { label: "Completados", value: "completados" },
      { label: "Archivados", value: "archivados" },
    ],
    value: "activos",
  },
};
