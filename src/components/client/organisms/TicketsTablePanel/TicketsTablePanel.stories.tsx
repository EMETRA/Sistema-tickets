import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketsTablePanel } from "./TicketsTablePanel";
import { useState } from "react";
import type { Ticket } from "./types";

const meta: Meta<typeof TicketsTablePanel> = {
    title: "Organisms/TicketsTablePanel",
    component: TicketsTablePanel,
    parameters: {
        layout: "padded",
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Datos de ejemplo
const sampleTickets: Ticket[] = [
    {
        id: 1,
        user: {
            id: 1,
            name: "Gildder Alberto Caceres Urizar",
            department: "Recursos Humanos",
            initials: "GC",
            avatarSrc: "https://i.pravatar.cc/150?img=12",
        },
        title: "Cancelar Remisión automóvil",
        description: "Remisión errónea a vehículo",
        date: "Hoy, 17:24",
        status: {
            label: "Ingresado",
            state: "assigned",
        },
        assignedTo: null,
    },
    {
        id: 2,
        user: {
            id: 1,
            name: "Gildder Alberto Caceres Urizar",
            department: "Recursos Humanos",
            initials: "G",
            avatarSrc: "https://i.pravatar.cc/150?img=12",
        },
        title: "Cambio de contraseña",
        description: "cambiar contraseña para ingresar a un sistema",
        date: "Hoy, 16:30",
        status: {
            label: "Ingresado",
            state: "assigned",
        },
        assignedTo: null,
    },
    {
        id: 3,
        user: {
            id: 2,
            name: "Feyser Emilio Caceres Urizar",
            department: "Informática",
            initials: "F",
            avatarSrc: "https://i.pravatar.cc/150?img=33",
        },
        title: "Solicitud de Mantenimiento",
        description: "Mantenimiento a computadora",
        date: "Ayer, 14:32",
        status: {
            label: "Asignado",
            state: "assigned",
        },
        assignedTo: {
            id: 3,
            name: "Roger Orlando",
            department: "Informática",
            initials: "R",
            avatarSrc: "https://i.pravatar.cc/150?img=68",
        },
    },
    {
        id: 4,
        user: {
            id: 4,
            name: "Dimas Gerardo Zamora Cont",
            department: "Informática",
            initials: "D",
            avatarSrc: "https://i.pravatar.cc/150?img=14",
        },
        title: "Solicitud de cambio de statu",
        description: "Cambiar el status de un usuario en el sistema de tickets",
        date: "03/02/2024, 08:12",
        status: {
            label: "Ingresado",
            state: "assigned",
        },
        assignedTo: null,
    },
    {
        id: 5,
        user: {
            id: 5,
            name: "Jose Hernandez",
            department: "Jurídico",
            initials: "J",
            avatarSrc: "https://i.pravatar.cc/150?img=52",
        },
        title: "Cambio de contraseña",
        description: "Cambio de contraseña de computadora",
        date: "02/02/2024, 17:24",
        status: {
            label: "Ingresado",
            state: "assigned",
        },
        assignedTo: null,
    },
    {
        id: 6,
        user: {
            id: 2,
            name: "Feyser Emilio Caceres Urizar",
            department: "Informática",
            initials: "F",
            avatarSrc: "https://i.pravatar.cc/150?img=33",
        },
        title: "Cancelar Remisión automóvil",
        description: "Remisión errónea a vehículo",
        date: "02/02/2024, 13:24",
        status: {
            label: "Ingresado",
            state: "assigned",
        },
        assignedTo: null,
    },
    {
        id: 7,
        user: {
            id: 5,
            name: "Jose Hernandez",
            department: "Jurídico",
            initials: "J",
            avatarSrc: "https://i.pravatar.cc/150?img=52",
        },
        title: "Mantenimiento",
        description: "Realizar mantenimiento de computadora",
        date: "01/02/2024, 16:24",
        status: {
            label: "En Trabajo",
            state: "inwork",
        },
        assignedTo: {
            id: 6,
            name: "Miguel Hernández",
            department: "Informática",
            initials: "M",
            avatarSrc: "https://i.pravatar.cc/150?img=15",
        },
    },
    {
        id: 8,
        user: {
            id: 4,
            name: "Dimas Gerardo Zamora Cont",
            department: "Informática",
            initials: "D",
            avatarSrc: "https://i.pravatar.cc/150?img=14",
        },
        title: "Cancelar Remisión automóvil",
        description: "Remisión errónea a vehículo",
        date: "31/01/2024, 12:24",
        status: {
            label: "Ingresado",
            state: "assigned",
        },
        assignedTo: null,
    },
];

/**
 * Vista básica del organismo TicketsTable
 */
export const Default: Story = {
    args: {
        tickets: sampleTickets,
        onDelete: (id) => console.log("Eliminar ticket:", id),
        onExport: () => console.log("Exportar tickets"),
    },
};

/**
 * Vista interactiva con manejo de estado
 * Permite probar los filtros y la eliminación de tickets
 */
export const Interactive: Story = {
    render: () => {
        const [tickets, setTickets] = useState<Ticket[]>(sampleTickets);

        const handleDelete = (ticketId: string | number) => {
            setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
            console.log("Ticket eliminado:", ticketId);
        };

        const handleExport = () => {
            console.log("Exportando tickets:", tickets);
            alert(`Se exportarían ${tickets.length} tickets`);
        };

        return (
            <TicketsTablePanel
                tickets={tickets}
                onDelete={handleDelete}
                onExport={handleExport}
            />
        );
    },
};

/**
 * Vista con estado de carga
 */
export const Loading: Story = {
    args: {
        tickets: [],
        loading: true,
    },
};

/**
 * Vista sin tickets (estado vacío)
 */
export const Empty: Story = {
    args: {
        tickets: [],
        loading: false,
    },
};

/**
 * Vista con pocos tickets
 */
export const FewTickets: Story = {
    args: {
        tickets: sampleTickets.slice(0, 3),
        onDelete: (id) => console.log("Eliminar ticket:", id),
        onExport: () => console.log("Exportar tickets"),
    },
};
