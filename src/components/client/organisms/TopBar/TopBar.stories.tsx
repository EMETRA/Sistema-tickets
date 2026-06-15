import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TopBar } from "./TopBar";

const meta: Meta<typeof TopBar> = {
    title: "Organisms/TopBar",
    component: TopBar,
};

export default meta;

export const PaginaPrincipal: StoryObj<typeof TopBar> = {
    args: {
        title: "Pagina Principal",
        iconName: "house-solid",
        userName: "Gildder Caceres",
        userRole: "Administrador",
        userStatus: "online"
    }
};

export const VistaEquipo: StoryObj<typeof TopBar> = {
    args: {
        title: "Equipo",
        iconName: "users-solid",
        userName: "Gildder Caceres",
        userRole: "Administrador",
        userStatus: "online"
    }
};