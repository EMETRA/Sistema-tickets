import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MyPerformanceChart } from "./MyPerformanceChart";

const meta = {
  title: "Organisms/MyPerformanceChart",
  component: MyPerformanceChart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Datos para el gráfico de rendimiento (en lineas)",
    },
  },
} satisfies Meta<typeof MyPerformanceChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Uso
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