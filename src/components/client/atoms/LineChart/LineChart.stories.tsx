import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LineChart } from "./";

const meta = {
  title: "Atoms/LineChart",
  component: LineChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Array de puntos de datos para la gráfica",
    },
    width: {
      control: { type: "number", min: 300, max: 1000, step: 50 },
      description: "Ancho de la gráfica en píxeles",
    },
    height: {
      control: { type: "number", min: 200, max: 600, step: 50 },
      description: "Alto de la gráfica en píxeles",
    },
    showGrid: {
      control: "boolean",
      description: "Mostrar la grilla",
    },
    lineColor: {
      control: "color",
      description: "Color de la línea",
    },
    areaColor: {
      control: "color",
      description: "Color del área bajo la línea",
    },
    strokeWidth: {
      control: { type: "number", min: 1, max: 5, step: 1 },
      description: "Grosor de la línea",
    },
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * LineChart por defecto con datos mensuales
 */
export const Default: Story = {
  args: {
    data: [
      { label: "Jul", value: 15 },
      { label: "Aug", value: 22 },
      { label: "Sep", value: 18 },
      { label: "Oct", value: 32 },
      { label: "Nov", value: 28 },
      { label: "Dec", value: 45 },
      { label: "Jan", value: 38 },
    ],
  },
};

/**
 * LineChart con datos de tickets mensuales
 */
export const MonthlyTickets: Story = {
  args: {
    data: [
      { label: "Ene", value: 120 },
      { label: "Feb", value: 150 },
      { label: "Mar", value: 180 },
      { label: "Abr", value: 140 },
      { label: "May", value: 200 },
      { label: "Jun", value: 220 },
      { label: "Jul", value: 190 },
      { label: "Ago", value: 250 },
      { label: "Sep", value: 210 },
      { label: "Oct", value: 240 },
      { label: "Nov", value: 280 },
      { label: "Dic", value: 300 },
    ],
    width: 800,
    height: 350,
  },
};

/**
 * LineChart con datos semanales
 */
export const WeeklyData: Story = {
  args: {
    data: [
      { label: "Lun", value: 45 },
      { label: "Mar", value: 52 },
      { label: "Mié", value: 48 },
      { label: "Jue", value: 61 },
      { label: "Vie", value: 55 },
      { label: "Sáb", value: 35 },
      { label: "Dom", value: 28 },
    ],
    width: 600,
    height: 300,
  },
};

/**
 * LineChart con muchos puntos de datos
 */
export const ManyDataPoints: Story = {
  args: {
    data: Array.from({ length: 20 }, (_, i) => ({
      label: `D${i + 1}`,
      value: Math.floor(Math.random() * 100) + 20,
    })),
    width: 800,
    height: 300,
  },
};

/**
 * LineChart sin grilla
 */
export const NoGrid: Story = {
  args: {
    data: [
      { label: "Q1", value: 150 },
      { label: "Q2", value: 180 },
      { label: "Q3", value: 220 },
      { label: "Q4", value: 280 },
    ],
    width: 600,
    height: 300,
    showGrid: false,
  },
};

/**
 * LineChart con tamaño pequeño
 */
export const SmallSize: Story = {
  args: {
    data: [
      { label: "Ene", value: 45 },
      { label: "Feb", value: 52 },
      { label: "Mar", value: 48 },
      { label: "Abr", value: 61 },
      { label: "May", value: 55 },
    ],
    width: 400,
    height: 200,
  },
};

/**
 * LineChart con tamaño grande
 */
export const LargeSize: Story = {
  args: {
    data: [
      { label: "Ene", value: 120 },
      { label: "Feb", value: 150 },
      { label: "Mar", value: 180 },
      { label: "Abr", value: 140 },
      { label: "May", value: 200 },
      { label: "Jun", value: 220 },
    ],
    width: 900,
    height: 450,
  },
};

/**
 * LineChart con colores personalizados
 */
export const CustomColors: Story = {
  args: {
    data: [
      { label: "Ene", value: 45 },
      { label: "Feb", value: 52 },
      { label: "Mar", value: 68 },
      { label: "Abr", value: 61 },
      { label: "May", value: 75 },
      { label: "Jun", value: 82 },
    ],
    width: 600,
    height: 300,
    lineColor: "#00BC70",
    areaColor: "#00BC70",
  },
};

/**
 * LineChart con línea más gruesa
 */
export const ThickLine: Story = {
  args: {
    data: [
      { label: "Ene", value: 45 },
      { label: "Feb", value: 52 },
      { label: "Mar", value: 48 },
      { label: "Abr", value: 61 },
      { label: "May", value: 55 },
    ],
    width: 600,
    height: 300,
    strokeWidth: 4,
  },
};

/**
 * LineChart con datos vacíos
 */
export const Empty: Story = {
  args: {
    data: [],
    width: 600,
    height: 300,
  },
};
