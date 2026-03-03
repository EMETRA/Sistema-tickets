import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TableHeader } from "./TableHeader";

const meta = {
  title: "Molecules/TableHeader",
  component: TableHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    iconName: {
      control: "text",
      description: "Nombre del ícono a mostrar",
    },
    label: {
      control: "text",
      description: "Texto del encabezado",
    },
  },
} satisfies Meta<typeof TableHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Encabezado con ícono de reporte y gráfica de barras
 */
export const Default: Story = {
  args: {
    iconName: "chart-bar-solid",
    label: "Reporte de rendimiento",
  },
};

/**
 * Encabezado con ícono de usuarios
 */
export const UsersReport: Story = {
  args: {
    iconName: "user-group-solid",
    label: "Lista de usuarios",
  },
};

/**
 * Encabezado con ícono de tickets
 */
export const TicketsReport: Story = {
  args: {
    iconName: "tickets",
    label: "Tickets del sistema",
  },
};

/**
 * Encabezado con ícono de correo
 */
export const EmailHeader: Story = {
  args: {
    iconName: "envelope-regular",
    label: "Correos y notificaciones",
  },
};

/**
 * Encabezado con ícono de archivo
 */
export const FileReport: Story = {
  args: {
    iconName: "file-lines-regular",
    label: "Documentos y archivos",
  },
};

/**
 * Encabezado con ícono de home
 */
export const DashboardHeader: Story = {
  args: {
    iconName: "house-solid",
    label: "Panel de control",
  },
};
