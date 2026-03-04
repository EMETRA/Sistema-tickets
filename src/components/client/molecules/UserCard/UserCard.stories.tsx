import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserCard } from "./UserCard";

const meta = {
  title: "Molecules/UserCard",
  component: UserCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "Nombre completo del usuario",
    },
    email: {
      control: "text",
      description: "Correo electrónico del usuario",
    },
    role: {
      control: "text",
      description: "Puesto o rol del usuario",
    },
    status: {
      control: "select",
      options: ["online", "offline", "busy", undefined],
      description: "Estado del usuario",
    },
    assignedCount: {
      control: "number",
      description: "Cantidad de tickets asignados",
    },
    resolvedCount: {
      control: "number",
      description: "Cantidad de tickets resueltos",
    },
    onStatusChange: {
      description: "Callback cuando se selecciona una opción del menú",
      action: "statusChanged",
    },
    onMenuClick: {
      description: "Callback cuando se hace clic en el botón de menú",
      action: "menuClicked",
    },
  },
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Card con el ejemplo de la imagen - Usuario online
 */
export const Default: Story = {
  args: {
    name: "Gildder Alberto Caceres Urizar",
    email: "albertourizar964@gmail.com",
    role: "Administrador",
    avatarInitials: "G",
    status: "online",
    assignedCount: 100,
    resolvedCount: 50,
  },
};

/**
 * Usuario con avatar de imagen
 */
export const WithAvatar: Story = {
  args: {
    name: "María González López",
    email: "maria.gonzalez@example.com",
    role: "Desarrolladora",
    avatarSrc: "https://i.pravatar.cc/150?img=5",
    status: "online",
    assignedCount: 25,
    resolvedCount: 18,
  },
};

/**
 * Usuario offline
 */
export const Offline: Story = {
  args: {
    name: "Carlos Ramírez",
    email: "carlos.ramirez@example.com",
    role: "Soporte Técnico",
    avatarInitials: "CR",
    status: "offline",
    assignedCount: 45,
    resolvedCount: 32,
  },
};

/**
 * Usuario ocupado
 */
export const Busy: Story = {
  args: {
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    role: "Project Manager",
    avatarInitials: "AM",
    status: "busy",
    assignedCount: 67,
    resolvedCount: 58,
  },
};

/**
 * Usuario sin estado
 */
export const WithoutStatus: Story = {
  args: {
    name: "Pedro Sánchez",
    email: "pedro.sanchez@example.com",
    role: "QA Tester",
    avatarInitials: "PS",
    assignedCount: 15,
    resolvedCount: 12,
  },
};

/**
 * Usuario con muchos tickets
 */
export const HighVolume: Story = {
  args: {
    name: "Laura Torres",
    email: "laura.torres@example.com",
    role: "Líder de Equipo",
    avatarInitials: "LT",
    status: "online",
    assignedCount: 250,
    resolvedCount: 200,
  },
};

/**
 * Usuario nuevo con pocos tickets
 */
export const NewUser: Story = {
  args: {
    name: "Miguel Hernández",
    email: "miguel.hernandez@example.com",
    role: "Trainee",
    avatarInitials: "MH",
    status: "online",
    assignedCount: 3,
    resolvedCount: 1,
  },
};

/**
 * Grid con múltiples usuarios
 */
export const MultipleCards = {
  render: () => (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
      gap: "24px",
      padding: "24px"
    }}>
      <UserCard
        name="Gildder Alberto Caceres Urizar"
        email="albertourizar964@gmail.com"
        role="Administrador"
        avatarInitials="G"
        status="online"
        assignedCount={100}
        resolvedCount={50}
        onMenuClick={() => console.log("Menu clicked")}
      />
      <UserCard
        name="María González"
        email="maria.gonzalez@example.com"
        role="Desarrolladora"
        avatarSrc="https://i.pravatar.cc/150?img=5"
        status="busy"
        assignedCount={25}
        resolvedCount={18}
        onMenuClick={() => console.log("Menu clicked")}
      />
      <UserCard
        name="Carlos Ramírez"
        email="carlos.ramirez@example.com"
        role="Soporte Técnico"
        avatarInitials="CR"
        status="offline"
        assignedCount={45}
        resolvedCount={32}
        onMenuClick={() => console.log("Menu clicked")}
      />
    </div>
  ),
};

/**
 * Con interacción del menú
 */
export const WithMenuAction: Story = {
  args: {
    name: "Sofia Mendoza",
    email: "sofia.mendoza@example.com",
    role: "Diseñadora UX",
    avatarInitials: "SM",
    status: "online",
    assignedCount: 12,
    resolvedCount: 8,
  },
};
