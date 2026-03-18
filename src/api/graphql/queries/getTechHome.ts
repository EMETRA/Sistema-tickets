import { EventItemProps } from "@/components/client/molecules/EventItem";
import { TicketData } from "@/components/client/organisms/TicketsPanel";

export interface PerformancePoint {
  label: string;
  value: number;
}

export interface TechStatistics {
  percentage: number;
  resolvedTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
}

export async function getPerformanceDataDummy(): Promise<PerformancePoint[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { label: "Jul", value: 15 },
                { label: "Aug", value: 22 },
                { label: "Sep", value: 18 },
                { label: "Oct", value: 32 },
                { label: "Nov", value: 28 },
                { label: "Dec", value: 45 },
                { label: "Jan", value: 38 },
            ]);
        }, 900);
    });
}

export async function getTechStatisticsDummy(): Promise<TechStatistics> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                percentage: 75,
                resolvedTickets: 15,
                assignedTickets: 5,
                inProgressTickets: 3,
            });
        }, 1000);
    });
}

export async function getTeamEventsDummy(): Promise<EventItemProps[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    type: "event",
                    eventName: "Nombre evento",
                    date: new Date("2026-03-10"),
                    iconColor: "#262626",
                    iconBackgroundColor: "#F5F5F5",
                },
                {
                    type: "event",
                    eventName: "Nombre evento",
                    date: new Date("2026-03-10"),
                    iconColor: "#262626",
                    iconBackgroundColor: "#F5F5F5",
                },
                {
                    type: "event",
                    eventName: "Nombre evento",
                    date: new Date("2026-03-10"),
                    iconColor: "#262626",
                    iconBackgroundColor: "#F5F5F5",
                },
                {
                    type: "event",
                    eventName: "Nombre evento",
                    date: new Date("2026-03-10"),
                    iconColor: "#262626",
                    iconBackgroundColor: "#F5F5F5",
                },
            ]);
        }, 1100);
    });
}

export async function getRecentTicketsDummy(): Promise<TicketData[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 125,
                    description: "Problemas con fotocopiadora",
                    userName: "Gildder Alberto Caceres Urizar",
                    avatarInitials: "G",
                    assigned: true,
                    type: "Urgente",
                    status: "inwork",
                    statusLabel: "En Trabajo",
                    dateIngress: new Date("2024-01-15"),
                    dateAssigned: new Date("2024-01-16"),
                },
                {
                    id: 124,
                    description: "Problemas con remision",
                    userName: "María González López",
                    avatarInitials: "MG",
                    assigned: true,
                    type: "Normal",
                    status: "resolved",
                    statusLabel: "Resuelto",
                    dateIngress: new Date("2024-01-14"),
                    dateAssigned: new Date("2024-01-15"),
                },
                {
                    id: 123,
                    description: "Sistema lento",
                    userName: "Carlos Ramírez",
                    avatarInitials: "CR",
                    assigned: true,
                    type: "Hardware",
                    status: "assigned",
                    statusLabel: "Asignado",
                    dateIngress: new Date("2024-01-13"),
                    dateAssigned: new Date("2024-01-14"),
                },
                {
                    id: 122,
                    description: "Error en aplicación",
                    userName: "Ana Martínez",
                    avatarInitials: "AM",
                    assigned: false,
                    type: "Software",
                    status: "ingressed",
                    statusLabel: "Ingresado",
                    dateIngress: new Date("2024-01-12"),
                },
                {
                    id: 121,
                    description: "Solicitud de acceso",
                    userName: "Pedro Sánchez",
                    avatarInitials: "PS",
                    assigned: true,
                    type: "Acceso",
                    status: "resolved",
                    statusLabel: "Resuelto",
                    dateIngress: new Date("2024-01-11"),
                    dateAssigned: new Date("2024-01-12"),
                },
            ]);
        }, 1200);
    });
}