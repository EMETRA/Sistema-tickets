import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BarChart } from "./";

const meta = {
  title: "Atoms/BarChart",
  component: BarChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Array de datos para las barras",
    },
    width: {
      control: { type: "number", min: 400, max: 1200, step: 50 },
      description: "Ancho de la gráfica en píxeles",
    },
    height: {
      control: { type: "number", min: 300, max: 700, step: 50 },
      description: "Alto de la gráfica en píxeles",
    },
    rounded: {
      control: "boolean",
      description: "Barras muy redondeadas (25px) vs normal (10px)",
    },
    showFullGrid: {
      control: "boolean",
      description: "Mostrar grid completo (horizontal y vertical)",
    },
    verticalLabels: {
      control: "boolean",
      description: "Labels del eje X en vertical",
    },
    colorScheme: {
      control: "select",
      options: ["green-gradient", "blue-gradient", "single", "multi-color"],
      description: "Esquema de colores a usar",
    },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * BarChart por defecto con gradiente azul
 */
export const Default: Story = {
  args: {
    data: [
      { label: "Enero", value: 1850 },
      { label: "Febrero", value: 1920 },
      { label: "Marzo", value: 1760 },
      { label: "Abril", value: 1320 },
      { label: "Mayo", value: 1120 },
      { label: "Junio", value: 1100 },
      { label: "Julio", value: 980 },
      { label: "Agosto", value: 710 },
      { label: "Septiembre", value: 650 },
    ],
    width: 800,
    height: 400,
  },
};

/**
 * BarChart con gradiente verde (de verde oscuro a amarillo)
 */
export const GreenGradient: Story = {
  args: {
    data: [
      { label: "Monica", value: 32500 },
      { label: "Joey", value: 31200 },
      { label: "Ross", value: 24800 },
      { label: "Phoebe", value: 18200 },
      { label: "Rachel", value: 14500 },
      { label: "Chandler", value: 11000 },
    ],
    width: 700,
    height: 400,
    colorScheme: "green-gradient",
  },
};

/**
 * BarChart con barras muy redondeadas
 */
export const Rounded: Story = {
  args: {
    data: [
      { label: "Q1", value: 2400 },
      { label: "Q2", value: 2100 },
      { label: "Q3", value: 2800 },
      { label: "Q4", value: 3200 },
    ],
    width: 600,
    height: 400,
    rounded: true,
    colorScheme: "green-gradient",
  },
};

/**
 * BarChart con grid completo
 */
export const FullGrid: Story = {
  args: {
    data: [
      { label: "Ene", value: 1850 },
      { label: "Feb", value: 1920 },
      { label: "Mar", value: 1760 },
      { label: "Abr", value: 1320 },
      { label: "May", value: 1120 },
      { label: "Jun", value: 1100 },
    ],
    width: 700,
    height: 400,
    showFullGrid: true,
  },
};

/**
 * BarChart con labels verticales
 */
export const VerticalLabels: Story = {
  args: {
    data: [
      { label: "Marketing", value: 3200 },
      { label: "Ventas", value: 2800 },
      { label: "Desarrollo", value: 2400 },
      { label: "Soporte", value: 1800 },
      { label: "Recursos Humanos", value: 1200 },
      { label: "Finanzas", value: 900 },
      { label: "Legal", value: 600 },
    ],
    width: 800,
    height: 400,
    verticalLabels: true,
    colorScheme: "blue-gradient",
  },
};

/**
 * BarChart con muchos datos y labels verticales
 */
export const ManyBars: Story = {
  args: {
    data: Array.from({ length: 12 }, (_, i) => ({
      label: new Date(2024, i).toLocaleDateString("es", { month: "short" }),
      value: Math.floor(Math.random() * 3000) + 500,
    })),
    width: 900,
    height: 400,
    verticalLabels: true,
    showFullGrid: true,
  },
};

/**
 * BarChart con colores múltiples
 */
export const MultiColor: Story = {
  args: {
    data: [
      { label: "Proyecto A", value: 4500 },
      { label: "Proyecto B", value: 3800 },
      { label: "Proyecto C", value: 3200 },
      { label: "Proyecto D", value: 2900 },
      { label: "Proyecto E", value: 2300 },
    ],
    width: 700,
    height: 400,
    colorScheme: "multi-color",
  },
};

/**
 * BarChart con color único
 */
export const SingleColor: Story = {
  args: {
    data: [
      { label: "Lun", value: 450 },
      { label: "Mar", value: 520 },
      { label: "Mié", value: 480 },
      { label: "Jue", value: 610 },
      { label: "Vie", value: 550 },
    ],
    width: 600,
    height: 400,
    colorScheme: "single",
    singleColor: "#00BC70",
  },
};

/**
 * BarChart redondeado con grid completo y labels verticales
 */
export const AllFeatures: Story = {
  args: {
    data: [
      { label: "Marketing Digital", value: 8500 },
      { label: "Ventas Directas", value: 7200 },
      { label: "Desarrollo Web", value: 6800 },
      { label: "Soporte Técnico", value: 5400 },
      { label: "Recursos Humanos", value: 4200 },
    ],
    width: 800,
    height: 450,
    rounded: true,
    showFullGrid: true,
    verticalLabels: true,
    colorScheme: "green-gradient",
  },
};

/**
 * BarChart vacío
 */
export const Empty: Story = {
  args: {
    data: [],
    width: 700,
    height: 400,
  },
};
