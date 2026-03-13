import { TicketStatData } from "@/components/client/organisms/DashboardStatsBar";
import { EventItemProps } from "@/components/client/molecules/EventItem";
import { TicketData } from "@/components/client/organisms/TicketsPanel";

export type PerformanceFilter = "annual" | "monthly" | "weekly" | "today";

export interface PerformancePoint {
  label: string;
  value: number;
}

export interface TicketResolvedPoint {
  label: string;
  value: number;
  color: string;
}

export async function   getDashboardStatsDummy(): Promise<TicketStatData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          type: "solved",
          label: "Tickets resueltos",
          value: 250,
        },
        {
          type: "working",
          label: "Tickets en Trabajo",
          value: 1250,
        },
        {
          type: "entered",
          label: "Tickets Ingresados",
          value: 450,
        },
        {
          type: "assigned",
          label: "Tickets Asignados",
          value: 450,
        },
      ]);
    }, 900);
  });
}

export async function getPerformanceByFilterDummy(): Promise<Record<PerformanceFilter, PerformancePoint[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        annual: [
          { label: "Monica", value: 38000 },
          { label: "Joey", value: 35000 },
          { label: "Ross", value: 26000 },
          { label: "Phoebe", value: 19000 },
          { label: "Rachel", value: 16000 },
          { label: "Chandler", value: 12000 },
        ],
        monthly: [
          { label: "Monica", value: 47000 },
          { label: "Joey", value: 35000 },
          { label: "Ross", value: 26000 },
          { label: "Phoebe", value: 16000 },
          { label: "Rachel", value: 16000 },
          { label: "Chandler", value: 11000 },
          { label: "Sofia", value: 17000 },
          { label: "Andrea", value: 28000 },
        ],
        weekly: [
          { label: "Monica", value: 5000 },
          { label: "Joey", value: 4200 },
          { label: "Ross", value: 3800 },
        ],
        today: [
          { label: "Monica", value: 800 },
          { label: "Joey", value: 650 },
        ],
      });
    }, 1000);
  });
}

export async function getTeamMovementsDummy(): Promise<EventItemProps[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          type: "movement",
          userName: "Gildder Alberto Caceres Urizar",
          avatarInitials: "G",
          label: { ticketId: 125, newState: "En Proceso" },
          date: new Date(),
        },
        {
          type: "movement",
          userName: "Gildder Alberto Caceres Urizar",
          avatarInitials: "G",
          label: { ticketId: 124, newState: "Resuelto" },
          date: new Date("2023-11-02"),
        },
        {
          type: "movement",
          userName: "Feyser Caceres",
          avatarInitials: "F",
          label: { ticketId: 10, newState: "En Proceso" },
          date: new Date("2023-11-01"),
        },
        {
          type: "movement",
          userName: "Juan Juan",
          avatarInitials: "JJ",
          label: { ticketId: 25, newState: "Asignado" },
          date: new Date("2023-12-03"),
        },
        {
          type: "movement",
          userName: "Pedro Pedro",
          avatarInitials: "PP",
          label: { ticketId: 26, newState: "Resuelto" },
          date: new Date("2026-01-01"),
        },
        {
          type: "movement",
          userName: "Pedro Pedro",
          avatarInitials: "PP",
          label: { ticketId: 27, newState: "En Proceso" },
          date: new Date("2026-01-05"),
        },
      ]);
    }, 1100);
  });
}

export async function getTicketsResolvedDummy(): Promise<TicketResolvedPoint[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { label: "Hardware", value: 5, color: "#FF9100" },
        { label: "Software", value: 3, color: "#00BC70" },
        { label: "Red", value: 2, color: "#FFCE00" },
        { label: "Acceso", value: 1, color: "#E63946" },
      ]);
    }, 1200);
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
        {
          id: 126,
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
          id: 127,
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
          id: 128,
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
      ]);
    }, 1300);
  });
}