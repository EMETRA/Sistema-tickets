import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DonutChart } from "./";

const meta = {
  title: "Atoms/DonutChart",
  component: DonutChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Array de datos para la gráfica de dona",
    },
    size: {
      control: { type: "number", min: 100, max: 400, step: 10 },
      description: "Tamaño de la gráfica en píxeles",
    },
    strokeWidth: {
      control: { type: "number", min: 20, max: 80, step: 5 },
      description: "Grosor del anillo de la dona",
    },
  },
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado por defecto del DonutChart con datos de ejemplo
 */
export const Default: Story = {
  args: {
    data: [
      { label: "Abiertos", value: 150 },
      { label: "En progreso", value: 200 },
      { label: "Cerrados", value: 100 },
      { label: "Pendientes", value: 50 },
    ],
  },
};

/**
 * DonutChart con datos de tickets
 */
export const TicketsStatus: Story = {
  args: {
    data: [
      { label: "Total tickets", value: 500 },
      { label: "Resueltos", value: 320 },
      { label: "En proceso", value: 150 },
      { label: "Sin asignar", value: 30 },
    ],
  },
};

/**
 * DonutChart con 7 categorías (usando todos los colores)
 */
export const SevenCategories: Story = {
  args: {
    data: [
      { label: "Categoría A", value: 100 },
      { label: "Categoría B", value: 80 },
      { label: "Categoría C", value: 60 },
      { label: "Categoría D", value: 90 },
      { label: "Categoría E", value: 70 },
      { label: "Categoría F", value: 50 },
      { label: "Categoría G", value: 40 },
    ],
  },
};

/**
 * DonutChart con solo 2 items
 */
export const TwoItems: Story = {
  args: {
    data: [
      { label: "Completado", value: 750 },
      { label: "Pendiente", value: 250 },
    ],
  },
};

/**
 * DonutChart con tamaño pequeño
 */
export const SmallSize: Story = {
  args: {
    data: [
      { label: "Abiertos", value: 150 },
      { label: "En progreso", value: 200 },
      { label: "Cerrados", value: 100 },
    ],
    size: 150,
    strokeWidth: 30,
  },
};

/**
 * DonutChart con tamaño grande
 */
export const LargeSize: Story = {
  args: {
    data: [
      { label: "Abiertos", value: 150 },
      { label: "En progreso", value: 200 },
      { label: "Cerrados", value: 100 },
    ],
    size: 300,
    strokeWidth: 60,
  },
};

/**
 * DonutChart con grosor grueso
 */
export const ThickStroke: Story = {
  args: {
    data: [
      { label: "Abiertos", value: 150 },
      { label: "En progreso", value: 200 },
      { label: "Cerrados", value: 100 },
    ],
    size: 200,
    strokeWidth: 60,
  },
};

/**
 * DonutChart sin datos
 */
export const Empty: Story = {
  args: {
    data: [],
    size: 200,
    strokeWidth: 40,
  },
};

/**
 * DonutChart con colores personalizados
 */
export const CustomColors: Story = {
  args: {
    data: [
      { label: "Urgente", value: 50, color: "#E63946" },
      { label: "Alta", value: 100, color: "#FF9100" },
      { label: "Media", value: 150, color: "#FFCE00" },
      { label: "Baja", value: 200, color: "#00BC70" },
    ],
    size: 200,
    strokeWidth: 40,
  },
};
