import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SideBarNavigation } from "./index";
import { useState } from "react";
import { getMenuByRole } from "../../../../config/navigation";
import { USER_ROLES } from "../../../../config/constants";

const meta: Meta<typeof SideBarNavigation> = {
    title: "Organisms/SideBarNavigation",
    component: SideBarNavigation,
};

export default meta;

const SidebarWithState = ({ role }: { role: keyof typeof USER_ROLES }) => {
    const [path, setPath] = useState("/home");
    const items = getMenuByRole(role).map((page) => ({
        path: page.path,
        label: page.label,
        iconName: page.iconName,
    }));

    return (
        <SideBarNavigation
            items={items}
            activePath={path}
            onNavigate={setPath}
        />
    );
};

export const Administrador: StoryObj = {
    render: () => <SidebarWithState role="ADMINISTRADOR" />,
};

export const Técnico: StoryObj = {
    render: () => <SidebarWithState role="TECNICO" />,
};

export const Usuario: StoryObj = {
    render: () => <SidebarWithState role="USUARIO" />,
};
