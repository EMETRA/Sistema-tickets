import { Ticket } from "@/components/client/organisms/TicketsTablePanel/types";
import { getAssignableUsersDummy } from "./getAssignableUsers";

const TICKETS_DB: Ticket[] = [
    {
        id: "1",
        user: {
            id: "1",
            name: "Gildder Alberto Caceres Urizar",
            department: "Recursos Humanos",
            initials: "GC",
            avatarSrc: "https://i.pravatar.cc/150?img=12",
        },
        title: "Cancelar Remision automovil",
        description: "Remision erronea a vehiculo",
        date: "Hoy, 17:24",
        status: {
            label: "Ingresado",
            state: "ingressed",
        },
        assignedTo: null,
    },
    {
        id: "2",
        user: {
            id: "2",
            name: "Feyser Emilio Caceres Urizar",
            department: "Informatica",
            initials: "F",
            avatarSrc: "https://i.pravatar.cc/150?img=33",
        },
        title: "Cambio de contrasena",
        description: "Cambiar contrasena para ingresar a un sistema",
        date: "Hoy, 16:30",
        status: {
            label: "Asignado",
            state: "assigned",
        },
        assignedTo: {
            id: "3",
            name: "Roger Orlando Perez",
            department: "Informatica",
            initials: "R",
            avatarSrc: "https://i.pravatar.cc/150?img=68",
        },
    },
    {
        id: "3",
        user: {
            id: "4",
            name: "Dimas Gerardo Zamora",
            department: "Contabilidad",
            initials: "D",
            avatarSrc: "https://i.pravatar.cc/150?img=14",
        },
        title: "Solicitud de mantenimiento",
        description: "Mantenimiento a computadora",
        date: "Ayer, 14:32",
        status: {
            label: "En Trabajo",
            state: "inwork",
        },
        assignedTo: {
            id: "11",
            name: "Miguel Torres",
            department: "Informatica",
            initials: "M",
            avatarSrc: "https://i.pravatar.cc/150?img=22",
        },
    },
    {
        id: "4",
        user: {
            id: "8",
            name: "Ana Martinez",
            department: "Contabilidad",
            initials: "A",
            avatarSrc: "https://i.pravatar.cc/150?img=15",
        },
        title: "Error en aplicacion",
        description: "Falla al ingresar a modulo de reportes",
        date: "03/02/2026, 08:12",
        status: {
            label: "Ingresado",
            state: "ingressed",
        },
        assignedTo: null,
    },
    {
        id: "5",
        user: {
            id: "9",
            name: "Luis Rodriguez",
            department: "Juridico",
            initials: "L",
            avatarSrc: "https://i.pravatar.cc/150?img=29",
        },
        title: "Solicitud de acceso",
        description: "Acceso a modulo de inventarios",
        date: "01/02/2026, 12:10",
        status: {
            label: "Resuelto",
            state: "resolved",
        },
        assignedTo: {
            id: "7",
            name: "Carlos Garcia",
            department: "Informatica",
            initials: "C",
            avatarSrc: "https://i.pravatar.cc/150?img=5",
        },
    },
    {
        id: "6",
        user: {
            id: "10",
            name: "Sofia Gonzalez",
            department: "Recursos Humanos",
            initials: "S",
            avatarSrc: "https://i.pravatar.cc/150?img=8",
        },
        title: "Impresora sin conexion",
        description: "No imprime en la oficina principal",
        date: "Hoy, 15:40",
        status: {
            label: "Ingresado",
            state: "ingressed",
        },
        assignedTo: null,
    },
    {
        id: "7",
        user: {
            id: "11",
            name: "Miguel Torres",
            department: "Informatica",
            initials: "M",
            avatarSrc: "https://i.pravatar.cc/150?img=22",
        },
        title: "Actualizacion de software",
        description: "Instalar nueva version del ERP",
        date: "Hoy, 14:10",
        status: {
            label: "Asignado",
            state: "assigned",
        },
        assignedTo: {
            id: "15",
            name: "Andres Ramirez",
            department: "Informatica",
            initials: "A",
            avatarSrc: "https://i.pravatar.cc/150?img=18",
        },
    },
    {
        id: "8",
        user: {
            id: "12",
            name: "Laura Ramirez",
            department: "Contabilidad",
            initials: "L",
            avatarSrc: "https://i.pravatar.cc/150?img=19",
        },
        title: "Acceso bloqueado",
        description: "No permite iniciar sesion en correo",
        date: "Hoy, 13:32",
        status: {
            label: "En Trabajo",
            state: "inwork",
        },
        assignedTo: {
            id: "7",
            name: "Carlos Garcia",
            department: "Informatica",
            initials: "C",
            avatarSrc: "https://i.pravatar.cc/150?img=5",
        },
    },
    {
        id: "9",
        user: {
            id: "13",
            name: "Diego Fernandez",
            department: "Juridico",
            initials: "D",
            avatarSrc: "https://i.pravatar.cc/150?img=45",
        },
        title: "Permisos de carpeta",
        description: "Solicita acceso de escritura",
        date: "Ayer, 17:58",
        status: {
            label: "Ingresado",
            state: "ingressed",
        },
        assignedTo: null,
    },
    {
        id: "10",
        user: {
            id: "14",
            name: "Valentina Sanchez",
            department: "Recursos Humanos",
            initials: "V",
            avatarSrc: "https://i.pravatar.cc/150?img=30",
        },
        title: "Equipo lento",
        description: "PC tarda mucho en encender",
        date: "Ayer, 16:20",
        status: {
            label: "Resuelto",
            state: "resolved",
        },
        assignedTo: {
            id: "11",
            name: "Miguel Torres",
            department: "Informatica",
            initials: "M",
            avatarSrc: "https://i.pravatar.cc/150?img=22",
        },
    },
    {
        id: "11",
        user: {
            id: "15",
            name: "Andres Ramirez",
            department: "Informatica",
            initials: "A",
            avatarSrc: "https://i.pravatar.cc/150?img=18",
        },
        title: "VPN intermitente",
        description: "Conexion se cae cada 10 minutos",
        date: "Ayer, 11:45",
        status: {
            label: "Asignado",
            state: "assigned",
        },
        assignedTo: {
            id: "3",
            name: "Roger Orlando Perez",
            department: "Informatica",
            initials: "R",
            avatarSrc: "https://i.pravatar.cc/150?img=68",
        },
    },
    {
        id: "12",
        user: {
            id: "6",
            name: "Maria Lopez",
            department: "Recursos Humanos",
            initials: "M",
            avatarSrc: "https://i.pravatar.cc/150?img=47",
        },
        title: "Error de firma digital",
        description: "No valida certificado al firmar",
        date: "12/03/2026, 15:12",
        status: {
            label: "Ingresado",
            state: "ingressed",
        },
        assignedTo: null,
    },
    {
        id: "13",
        user: {
            id: "7",
            name: "Carlos Garcia",
            department: "Informatica",
            initials: "C",
            avatarSrc: "https://i.pravatar.cc/150?img=5",
        },
        title: "Configuracion de correo",
        description: "Outlook no sincroniza bandeja",
        date: "12/03/2026, 10:18",
        status: {
            label: "En Trabajo",
            state: "inwork",
        },
        assignedTo: {
            id: "11",
            name: "Miguel Torres",
            department: "Informatica",
            initials: "M",
            avatarSrc: "https://i.pravatar.cc/150?img=22",
        },
    },
    {
        id: "14",
        user: {
            id: "3",
            name: "Roger Orlando Perez",
            department: "Informatica",
            initials: "R",
            avatarSrc: "https://i.pravatar.cc/150?img=68",
        },
        title: "Solicitud de licencia",
        description: "Requiere licencia de herramienta BI",
        date: "11/03/2026, 17:02",
        status: {
            label: "Asignado",
            state: "assigned",
        },
        assignedTo: {
            id: "15",
            name: "Andres Ramirez",
            department: "Informatica",
            initials: "A",
            avatarSrc: "https://i.pravatar.cc/150?img=18",
        },
    },
    {
        id: "15",
        user: {
            id: "5",
            name: "Jose Hernandez",
            department: "Juridico",
            initials: "J",
            avatarSrc: "https://i.pravatar.cc/150?img=52",
        },
        title: "Validacion de usuario",
        description: "Cuenta duplicada en el sistema",
        date: "11/03/2026, 13:27",
        status: {
            label: "Resuelto",
            state: "resolved",
        },
        assignedTo: {
            id: "7",
            name: "Carlos Garcia",
            department: "Informatica",
            initials: "C",
            avatarSrc: "https://i.pravatar.cc/150?img=5",
        },
    },
    {
        id: "16",
        user: {
            id: "1",
            name: "Gildder Alberto Caceres Urizar",
            department: "Recursos Humanos",
            initials: "GC",
            avatarSrc: "https://i.pravatar.cc/150?img=12",
        },
        title: "No abre archivo PDF",
        description: "Error al abrir documentos adjuntos",
        date: "10/03/2026, 18:44",
        status: {
            label: "Ingresado",
            state: "ingressed",
        },
        assignedTo: null,
    },
    {
        id: "17",
        user: {
            id: "2",
            name: "Feyser Emilio Caceres Urizar",
            department: "Informatica",
            initials: "F",
            avatarSrc: "https://i.pravatar.cc/150?img=33",
        },
        title: "Pantalla azul",
        description: "Reinicio inesperado de equipo",
        date: "10/03/2026, 16:05",
        status: {
            label: "Asignado",
            state: "assigned",
        },
        assignedTo: {
            id: "11",
            name: "Miguel Torres",
            department: "Informatica",
            initials: "M",
            avatarSrc: "https://i.pravatar.cc/150?img=22",
        },
    },
    {
        id: "18",
        user: {
            id: "4",
            name: "Dimas Gerardo Zamora",
            department: "Contabilidad",
            initials: "D",
            avatarSrc: "https://i.pravatar.cc/150?img=14",
        },
        title: "Modulo no responde",
        description: "Se congela al guardar datos",
        date: "10/03/2026, 11:33",
        status: {
            label: "En Trabajo",
            state: "inwork",
        },
        assignedTo: {
            id: "3",
            name: "Roger Orlando Perez",
            department: "Informatica",
            initials: "R",
            avatarSrc: "https://i.pravatar.cc/150?img=68",
        },
    },
    {
        id: "19",
        user: {
            id: "8",
            name: "Ana Martinez",
            department: "Contabilidad",
            initials: "A",
            avatarSrc: "https://i.pravatar.cc/150?img=15",
        },
        title: "Solicitud de alta de usuario",
        description: "Nuevo colaborador requiere cuenta",
        date: "09/03/2026, 15:22",
        status: {
            label: "Ingresado",
            state: "ingressed",
        },
        assignedTo: null,
    },
    {
        id: "20",
        user: {
            id: "9",
            name: "Luis Rodriguez",
            department: "Juridico",
            initials: "L",
            avatarSrc: "https://i.pravatar.cc/150?img=29",
        },
        title: "Certificado vencido",
        description: "Renovar certificado SSL interno",
        date: "09/03/2026, 09:50",
        status: {
            label: "Asignado",
            state: "assigned",
        },
        assignedTo: {
            id: "15",
            name: "Andres Ramirez",
            department: "Informatica",
            initials: "A",
            avatarSrc: "https://i.pravatar.cc/150?img=18",
        },
    },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cloneTicket = (ticket: Ticket): Ticket => ({
    ...ticket,
    user: { ...ticket.user },
    assignedTo: ticket.assignedTo ? { ...ticket.assignedTo } : null,
    status: { ...ticket.status },
});

export async function getTicketsDummy(): Promise<Ticket[]> {
    // TODO: Implementar query GraphQL real
    // const response = await graphqlClient.post("", { query: GET_TICKETS_QUERY });
    // return response.data.data.tickets;
    await wait(700);
    return TICKETS_DB.map(cloneTicket);
}

export async function assignTicketDummy(ticketId: string | number, userId: string): Promise<Ticket> {
    // TODO: Implementar mutacion GraphQL real
    // const response = await graphqlClient.post("", { mutation: ASSIGN_TICKET, variables: { ticketId, userId } });
    // return response.data.data.assignTicket;
    await wait(500);

    const users = await getAssignableUsersDummy();
    const selectedUser = users.find((user) => user.id === userId);
    if (!selectedUser) {
        throw new Error("Usuario no encontrado para asignacion.");
    }

    const index = TICKETS_DB.findIndex((ticket) => ticket.id === ticketId);
    if (index === -1) {
        throw new Error("Ticket no encontrado para asignacion.");
    }

    const current = TICKETS_DB[index];
    const updated: Ticket = {
        ...current,
        assignedTo: {
            id: selectedUser.id,
            name: selectedUser.userInfo.userName,
            initials: selectedUser.userInfo.avatarProps?.initials,
            avatarSrc: selectedUser.userInfo.avatarProps?.src,
            department: selectedUser.workstation,
        },
        status: current.status.state === "ingressed"
            ? { label: "Asignado", state: "assigned" }
            : current.status,
    };

    TICKETS_DB[index] = updated;
    return cloneTicket(updated);
}

export async function cancelTicketDummy(ticketId: string | number): Promise<void> {
    // TODO: Implementar mutacion GraphQL real
    // await graphqlClient.post("", { mutation: CANCEL_TICKET, variables: { ticketId } });
    await wait(600);

    const index = TICKETS_DB.findIndex((ticket) => ticket.id === ticketId);
    if (index === -1) {
        throw new Error("Ticket no encontrado para cancelacion.");
    }

    TICKETS_DB[index] = {
        ...TICKETS_DB[index],
        status: {
            label: "Cancelado",
            state: "canceled",
        },
    };
}
