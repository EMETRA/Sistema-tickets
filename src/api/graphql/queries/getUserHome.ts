import { AppCardProps } from "@/components/client/molecules/AppCard/types";
import { EventItemProps } from "@/components/client/molecules/EventItem";

export interface UserSummary {
  name: string;
  role: string;
}

export interface ReportTableDataPoint {
  label: string;
  value: number;
}

export async function getUserSummaryDummy(): Promise<UserSummary> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: "Gildder Caceres",
                role: "user",
            });
        }, 800);
    });
}

export async function getMyAppsDummy(): Promise<AppCardProps[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { title: "Sistema de tickets", icon: "ticket", iconLabel: "Emetra", iconColor: "#99cc33", bookmarked: true },
                { title: "Sistema de Transporte", icon: "bus-side-solid", iconLabel: "MDT", iconColor: "#6F87FB", bookmarked: false },
                { title: "Gestión de Personal", icon: "users", iconLabel: "RRHH", iconColor: "#FFB347", bookmarked: false },
                { title: "Reportes Diarios", icon: "ticket", iconLabel: "Admin", iconColor: "#9C27B0", bookmarked: true },
                { title: "Inventario", icon: "bus-side-solid", iconLabel: "Bodega", iconColor: "#D32F2F", bookmarked: false },
            ]);
        }, 1000);
    });
}

export async function getMyActivityDummy(): Promise<EventItemProps[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    type: "movement",
                    userName: "Gildder Urizar",
                    avatarInitials: "G",
                    label: "Problemas con fotocopiadora",
                    date: new Date(),
                },
                {
                    type: "movement",
                    userName: "Gildder Urizar",
                    avatarInitials: "G",
                    label: "Problemas con remision",
                    date: new Date("2023-11-02"),
                },
                {
                    type: "movement",
                    userName: "Gildder Urizar",
                    avatarInitials: "G",
                    label: "Problemas con remision",
                    date: new Date("2023-11-01"),
                },
                {
                    type: "movement",
                    userName: "Gildder Urizar",
                    avatarInitials: "G",
                    label: "Problemas en revision adfadsfadsfdsfdsfsdd sdfdsf sfsf fsdfsdfds sasdljkfañfkjña dkfjñalksdjf añlkjf añsldkfja ñsldkfj añsldfjkda dsfsñ",
                    date: new Date("2023-11-01"),
                },
            ]);
        }, 1200);
    });
}

export async function getReportTableDataDummy(): Promise<ReportTableDataPoint[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { label: "Enero", value: 1800 },
                { label: "Febrero", value: 1800 },
                { label: "Marzo", value: 1750 },
                { label: "Abril", value: 1300 },
                { label: "Mayo", value: 1100 },
                { label: "Junio", value: 1100 },
                { label: "Julio", value: 950 },
                { label: "Agosto", value: 700 },
                { label: "Septiembre", value: 650 },
                { label: "Octubre", value: 600 },
                { label: "Noviembre", value: 550 },
                { label: "Diciembre", value: 500 },
            ]);
        }, 1400);
    });
}