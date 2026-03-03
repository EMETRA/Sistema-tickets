import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatInLine } from "./";

const meta = {
  title: "Molecules/StatInLine",
  component: StatInLine,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["resolved", "assigned", "in-progress"],
      description: "Tipo predefinido de estadística (usa colores automáticos)",
    },
    label: {
      control: "text",
      description: "Texto del label",
    },
    value: {
      control: "number",
      description: "Valor numérico a mostrar",
    },
    size: {
      control: "select",
      options: ["small", "medium"],
      description: "Tamaño del componente",
    },
    color: {
      control: "color",
      description: "Color personalizado del valor (solo si no se usa type)",
    },
  },
} satisfies Meta<typeof StatInLine>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estadística de Asignados - Tamaño Small (tipo predefinido)
 */
export const AsignadosSmall: Story = {
  args: {
    type: "assigned",
    label: "Asignados",
    value: 100,
    size: "small",
  },
};

/**
 * Estadística de Resueltos - Tamaño Small (tipo predefinido)
 */
export const ResueltosSmall: Story = {
  args: {
    type: "resolved",
    label: "Resueltos",
    value: 45,
    size: "small",
  },
};

/**
 * Estadística de Resueltos - Tamaño Medium (tipo predefinido)
 */
export const ResueltosMedium: Story = {
  args: {
    type: "resolved",
    label: "Resueltos",
    value: 75,
    size: "medium",
  },
};

/**
 * Estadística de Asignados - Tamaño Medium (tipo predefinido)
 */
export const AsignadosMedium: Story = {
  args: {
    type: "assigned",
    label: "Asignados",
    value: 75,
    size: "medium",
  },
};

/**
 * Estadística de En Proceso - Tamaño Medium (tipo predefinido)
 */
export const EnProcesoMedium: Story = {
  args: {
    type: "in-progress",
    label: "En Proceso",
    value: 45,
    size: "medium",
  },
};

/**
 * Estadística con color personalizado - Small
 */
export const CustomColorSmall: Story = {
  args: {
    label: "Total",
    value: 250,
    color: "#4361EE",
    size: "small",
  },
};

/**
 * Estadística con color personalizado - Medium
 */
export const CustomColorMedium: Story = {
  args: {
    label: "Pendientes",
    value: 12,
    color: "#E63946",
    size: "medium",
  },
};
