import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MemberSelect } from "./MemberSelect";
import { useState } from "react";
import { Member } from "./types";

const meta = {
  title: "Molecules/MemberSelect",
  component: MemberSelect,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    members: {
      description: "Lista de miembros disponibles para seleccionar",
    },
    selectedId: {
      control: "text",
      description: "ID del miembro seleccionado actualmente",
    },
    placeholder: {
      control: "text",
      description: "Texto que aparece cuando no hay selección",
    },
  },
} satisfies Meta<typeof MemberSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// Datos de ejemplo
const sampleMembers: Member[] = [
  {
    id: 1,
    name: "Feyser Caceres",
    initials: "F",
  },
  {
    id: 2,
    name: "Melanie Bracamonte",
    initials: "M",
  },
  {
    id: 3,
    name: "Gerardo Zamora",
    initials: "G",
  },
  {
    id: 4,
    name: "Roger Herrera",
    initials: "R",
  },
  {
    id: 5,
    name: "Miguel Hernández",
    initials: "M",
  },
];

/**
 * Select sin selección inicial
 */
export const Default: Story = {
  args: {
    members: sampleMembers,
    placeholder: "Seleccionar miembro",
  },
};

/**
 * Select con un miembro preseleccionado
 */
export const WithSelection: Story = {
  args: {
    members: sampleMembers,
    selectedId: 3,
  },
};

/**
 * Select con avatares de imagen
 */
export const WithAvatarImages: Story = {
  args: {
    members: [
      {
        id: 1,
        name: "Ana García",
        avatarSrc: "https://i.pravatar.cc/150?img=5",
      },
      {
        id: 2,
        name: "Carlos López",
        avatarSrc: "https://i.pravatar.cc/150?img=12",
      },
      {
        id: 3,
        name: "María Rodríguez",
        avatarSrc: "https://i.pravatar.cc/150?img=9",
      },
    ],
    selectedId: 1,
  },
};

/**
 * Select con muchos miembros (scroll)
 */
export const WithManyMembers: Story = {
  args: {
    members: [
      { id: 1, name: "Feyser Caceres", initials: "F" },
      { id: 2, name: "Melanie Bracamonte", initials: "M" },
      { id: 3, name: "Gerardo Zamora", initials: "G" },
      { id: 4, name: "Roger Herrera", initials: "R" },
      { id: 5, name: "Miguel Hernández", initials: "M" },
      { id: 6, name: "Ana Martínez", initials: "A" },
      { id: 7, name: "Pedro Sánchez", initials: "P" },
      { id: 8, name: "Laura Torres", initials: "L" },
      { id: 9, name: "Juan Ramírez", initials: "J" },
      { id: 10, name: "Sofia Mendoza", initials: "S" },
    ],
  },
};

/**
 * Select interactivo con estado controlado
 */
export const Interactive = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | number | undefined>(undefined);
    const [lastSelected, setLastSelected] = useState<Member | null>(null);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <MemberSelect
          members={sampleMembers}
          selectedId={selectedId}
          onSelect={(member) => {
            setSelectedId(member.id);
            setLastSelected(member);
          }}
          placeholder="Selecciona un miembro del equipo"
        />
        
        {lastSelected && (
          <div style={{ 
            padding: "16px", 
            backgroundColor: "#F5F5F5", 
            borderRadius: "8px",
            fontFamily: "Montserrat, sans-serif"
          }}>
            <strong>Último seleccionado:</strong>
            <div>ID: {lastSelected.id}</div>
            <div>Nombre: {lastSelected.name}</div>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Select con placeholder personalizado
 */
export const CustomPlaceholder: Story = {
  args: {
    members: sampleMembers,
    placeholder: "Elige un miembro...",
  },
};
