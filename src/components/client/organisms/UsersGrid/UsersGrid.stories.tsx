import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UsersGrid } from "./index";

const meta: Meta<typeof UsersGrid> = {
    title: "Organisms/UsersGrid",
    component: UsersGrid,
};

export default meta;

export const Default: StoryObj<typeof UsersGrid> = {
    args: {
        title: "Usuarios asignados",
        iconName: "users-solid",
        users: [
        { 
            name: "Gildder Alberto Caceres Urizar", 
            email: "albertourizar94@gmail.com", 
            role: "Administrador", 
            avatarInitials: "G", 
            status: "online", 
            assignedCount: 100, 
            resolvedCount: 50 
        },
        { 
            name: "Feyzer Emilio Caceres Urizar", 
            email: "feyzeremiliocaceres@gmail.com", 
            role: "Desarrollador", 
            avatarInitials: "F", 
            status: "offline", 
            assignedCount: 500, 
            resolvedCount: 325 
        },
        { 
            name: "Jose Hernandez", 
            email: "josehernandez@muniguate.com", 
            role: "Tecnico", 
            avatarInitials: "J", 
            status: "online", 
            assignedCount: 50, 
            resolvedCount: 48 
        },
                { 
            name: "Jose Hernandez", 
            email: "josehernandez@muniguate.com", 
            role: "Tecnico", 
            avatarInitials: "J", 
            status: "online", 
            assignedCount: 50, 
            resolvedCount: 48 
        },
                { 
            name: "Jose Hernandez", 
            email: "josehernandez@muniguate.com", 
            role: "Tecnico", 
            avatarInitials: "J", 
            status: "online", 
            assignedCount: 50, 
            resolvedCount: 48 
        },
                { 
            name: "Jose Hernandez", 
            email: "josehernandez@muniguate.com", 
            role: "Tecnico", 
            avatarInitials: "J", 
            status: "online", 
            assignedCount: 50, 
            resolvedCount: 48 
        },
                { 
            name: "Jose Hernandez", 
            email: "josehernandez@muniguate.com", 
            role: "Tecnico", 
            avatarInitials: "J", 
            status: "online", 
            assignedCount: 50, 
            resolvedCount: 48 
        },
    ]
    }
};