import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserChip } from "./UserChip";

const meta = {
  title: "Atoms/UserChip",
  component: UserChip,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    userName: {
      control: "text",
      description: "Nombre del usuario asignado",
    },
    avatarProps: {
      avatarSrc: {
      control: "text",
      description: "URL de la imagen del avatar",
      },
      avatarInitials: {
      control: "text",
      description: "Iniciales del usuario",
      },
    }
  },
} satisfies Meta<typeof UserChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Usuario con iniciales
 */
export const WithInitials: Story = {
  args: {
    userName: "Miguel Hernández",
    avatarProps: {
      initials: "M",
    },
  },
};

/**
 * Usuario con imagen
 */
export const WithImage: Story = {
  args: {
    userName: "Ana García",
    avatarProps: {
      src: "https://i.pravatar.cc/150?img=5",
    },
  },
};