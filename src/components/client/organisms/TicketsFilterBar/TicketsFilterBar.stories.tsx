import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketsFilterBar } from "./TicketsFilterBar";
import { useState } from "react";
import type { Member } from "../../molecules/MemberSelect/types";

// Datos de ejemplo de miembros
const sampleMembers: Member[] = [
    {
        id: 1,
        name: "Ana García",
        initials: "AG",
        avatarSrc: "https://i.pravatar.cc/150?img=1",
    },
    {
        id: 2,
        name: "Carlos Rodríguez",
        initials: "CR",
        avatarSrc: "https://i.pravatar.cc/150?img=2",
    },
    {
        id: 3,
        name: "María López",
        initials: "ML",
        avatarSrc: "https://i.pravatar.cc/150?img=3",
    },
    {
        id: 4,
        name: "Juan Martínez",
        initials: "JM",
        avatarSrc: "https://i.pravatar.cc/150?img=4",
    },
    {
        id: 5,
        name: "Laura Sánchez",
        initials: "LS",
        avatarSrc: "https://i.pravatar.cc/150?img=5",
    },
];

const meta = {
    title: "Organisms/TicketsFilterBar",
    component: TicketsFilterBar,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        selectedFilter: {
            control: "text",
            description: "Filtro seleccionado actualmente",
        },
        disabled: {
            control: "boolean",
            description: "Si los controles están deshabilitados",
        },
    },
} satisfies Meta<typeof TicketsFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado predeterminado con "Todos" seleccionado
 */
export const Default: Story = {
    args: {
        filterOptions: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
        ],
        selectedFilter: "all",
        onFilterChange: (value) => console.log("Filter changed:", value),
        onExport: () => console.log("Export clicked"),
        members: sampleMembers,
        onMemberSelect: (member) => console.log("Member selected:", member),
    },
};

/**
 * Con filtro "Asignados" seleccionado
 */
export const AssignedSelected: Story = {
    args: {
        filterOptions: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
        ],
        selectedFilter: "assigned",
        onFilterChange: (value) => console.log("Filter changed:", value),
        onExport: () => console.log("Export clicked"),
        members: sampleMembers,
        selectedMemberId: 2,
        onMemberSelect: (member) => console.log("Member selected:", member),
    },
};

/**
 * Con múltiples opciones de filtro
 */
export const MultipleFilters: Story = {
    args: {
        filterOptions: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
            { label: "Completados", value: "completed", icon: "check-slot-solid-full" },
        ],
        selectedFilter: "all",
        onFilterChange: (value) => console.log("Filter changed:", value),
        onExport: () => console.log("Export clicked"),
        members: sampleMembers,
        onMemberSelect: (member) => console.log("Member selected:", member),
    },
};

/**
 * Estado deshabilitado
 */
export const Disabled: Story = {
    args: {
        filterOptions: [
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
        ],
        selectedFilter: "all",
        disabled: true,
        onFilterChange: (value) => console.log("Filter changed:", value),
        onExport: () => console.log("Export clicked"),
        members: sampleMembers,
        onMemberSelect: (member) => console.log("Member selected:", member),
    },
};

/**
 * Componente interactivo
 */
export const Interactive = {
    render: () => {
        const [selectedFilter, setSelectedFilter] = useState("all");
        const [selectedMemberId, setSelectedMemberId] = useState<string | number | undefined>(undefined);
        const [lastAction, setLastAction] = useState<string>("");

        const handleExport = () => {
            setLastAction("Exportar clickeado");
            console.log("Export clicked");
        };

        const handleMemberSelect = (member: Member | undefined) => {
            setSelectedMemberId(member?.id);
            setLastAction(member ? `Miembro seleccionado: ${member.name}` : "Filtro de miembro removido");
            console.log("Member selected:", member);
        };

        const handleFilterChange = (value: string) => {
            setSelectedFilter(value);
            setLastAction(`Filtro cambiado a: ${value}`);
        };

        return (
            <div>
                <TicketsFilterBar
                    filterOptions={[
                        { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
                        { label: "Cancelados", value: "cancelled", icon: "xmark-solid" },
                    ]}
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                    onExport={handleExport}
                    members={sampleMembers}
                    selectedMemberId={selectedMemberId}
                    onMemberSelect={handleMemberSelect}
                />
                <div style={{ marginTop: "20px", padding: "10px", background: "#f5f5f5" }}>
                    <p>Filtro seleccionado: <strong>{selectedFilter}</strong></p>
                    <p>Miembro seleccionado: <strong>{selectedMemberId ? sampleMembers.find(m => m.id === selectedMemberId)?.name : "Ninguno"}</strong></p>
                    {lastAction && <p>Última acción: <strong>{lastAction}</strong></p>}
                </div>
            </div>
        );
    },
};

/**
 * Solo con "Todos" (sin filtros adicionales)
 */
export const OnlyAllFilter: Story = {
    args: {
        filterOptions: [],
        selectedFilter: "all",
        onFilterChange: (value) => console.log("Filter changed:", value),
        onExport: () => console.log("Export clicked"),
        members: sampleMembers,
        onMemberSelect: (member) => console.log("Member selected:", member),
    },
};
