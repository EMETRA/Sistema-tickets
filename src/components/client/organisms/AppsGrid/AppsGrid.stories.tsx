import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppsGrid } from "./index";

const meta: Meta<typeof AppsGrid> = {
    title: "Organisms/AppsGrid",
    component: AppsGrid,
};

export default meta;

export const Default: StoryObj<typeof AppsGrid> = {
    args: {
        title: "Mi Apps",
        apps: [
            { title: "Sistema de tickets", icon: "ticket", iconLabel: "Emetra", iconColor: "#99cc33", bookmarked: true },
            { title: "Sistema de Transporte", icon: "bus-side-solid", iconLabel: "MDT", iconColor: "#6F87FB", bookmarked: false },
            { title: "Gestión de Personal", icon: "users", iconLabel: "RRHH", iconColor: "#FFB347", bookmarked: false },
            { title: "Reportes Diarios", icon: "ticket", iconLabel: "Admin", iconColor: "#9C27B0", bookmarked: true },
            { title: "Inventario", icon: "bus-side-solid", iconLabel: "Bodega", iconColor: "#D32F2F", bookmarked: false },
        ]
    }
};