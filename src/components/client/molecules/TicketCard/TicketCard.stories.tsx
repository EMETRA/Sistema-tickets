import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketCard } from "./";

const meta = {
  title: "Molecules/TicketCard",
  component: TicketCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["ingresados", "resueltos", "en-proceso"],
      description: "Tipo predefinido de tarjeta (usa colores e íconos automáticos)",
    },
    label: {
      control: "text",
      description: "Texto del título de la tarjeta",
    },
    value: {
      control: "number",
      description: "Número de tickets a mostrar",
    },
    color: {
      control: "color",
      description: "Color del ícono y del número",
    },
    iconName: {
      control: "text",
      description: "Nombre del ícono (sin extensión .svg)",
    },
  },
} satisfies Meta<typeof TicketCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Tarjeta de Tickets Ingresados
 */
export const TicketsIngresados: Story = {
  args: {
    type: "entered",
    label: "Tickets Ingresados",
    value: 150,
  },
};

/**
 * Tarjeta de Tickets Resueltos
 */
export const TicketsResueltos: Story = {
  args: {
    type: "solved",
    label: "Tickets Resueltos",
    value: 89,
  },
};

/**
 * Tarjeta de Tickets en Proceso
 */
export const TicketsEnProceso: Story = {
  args: {
    type: "in-progress",
    label: "Tickets en Proceso",
    value: 45,
  },
};

/**
 * Tarjeta con color e ícono personalizados (sin tipo predefinido)
 */
export const ValorGrande: Story = {
  args: {
    label: "Total de Tickets",
    value: 1250,
    color: "#54C8E8",
    iconName: "ticket",
  },
};

/**
 * Tarjeta con color e ícono personalizados (sin tipo predefinido)
 */
export const ValorPequeño: Story = {
  args: {
    label: "Tickets Críticos",
    value: 3,
    color: "#E63946",
    iconName: "ticket",
  },
};
