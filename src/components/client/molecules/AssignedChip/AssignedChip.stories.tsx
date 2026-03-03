import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AssignedChip } from "./AssignedChip";

const meta = {
  title: "Molecules/AssignedChip",
  component: AssignedChip,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    assigned: {
      control: "boolean",
      description: "Indica si está asignado a un usuario",
    },
    userName: {
      control: "text",
      description: "Nombre del usuario asignado",
    },
    avatarSrc: {
      control: "text",
      description: "URL de la imagen del avatar",
    },
    avatarInitials: {
      control: "text",
      description: "Iniciales del usuario",
    },
  },
} satisfies Meta<typeof AssignedChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado sin asignación - muestra avatar genérico y texto "Sin Asignacion"
 */
export const Unassigned: Story = {
  args: {
    assigned: false,
  },
};

/**
 * Usuario asignado con iniciales
 */
export const AssignedWithInitials: Story = {
  args: {
    assigned: true,
    userName: "Miguel Hernández",
    avatarInitials: "M",
  },
};

/**
 * Usuario asignado con imagen
 */
export const AssignedWithImage: Story = {
  args: {
    assigned: true,
    userName: "Ana García",
    avatarSrc: "https://i.pravatar.cc/150?img=5",
  },
};

/**
 * Usuario asignado con iniciales personalizadas
 */
export const AssignedCustomInitials: Story = {
  args: {
    assigned: true,
    userName: "Carlos Ramírez López",
    avatarInitials: "CRL",
  },
};

/**
 * Usuario con nombre corto
 */
export const AssignedShortName: Story = {
  args: {
    assigned: true,
    userName: "Juan Pérez",
    avatarInitials: "JP",
  },
};

/**
 * Comparación de ambos estados
 */
export const Comparison = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <AssignedChip assigned={false} />
      <AssignedChip 
        assigned={true}
        userName="Miguel Hernández"
        avatarInitials="M"
      />
      <AssignedChip 
        assigned={true}
        userName="Ana García"
        avatarSrc="https://i.pravatar.cc/150?img=5"
      />
    </div>
  ),
};
