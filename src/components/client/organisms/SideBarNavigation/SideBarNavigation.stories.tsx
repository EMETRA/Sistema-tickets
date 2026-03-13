import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SideBarNavigation } from "./index";
import { useState } from "react";

const meta: Meta<typeof SideBarNavigation> = {
    title: "Organisms/SideBarNavigation",
    component: SideBarNavigation,
};

export default meta;

const SidebarWithState = ({ role }: { role: "admin" | "tech" | "user" }) => {
    const [path, setPath] = useState("/");
    return <SideBarNavigation role={role} activePath={path} onNavigate={setPath} />;
};

export const Administrador: StoryObj = {
    render: () => <SidebarWithState role="admin" />
};

export const Técnico: StoryObj = {
    render: () => <SidebarWithState role="tech" />
};

export const Usuario: StoryObj = {
    render: () => <SidebarWithState role="user" />
};