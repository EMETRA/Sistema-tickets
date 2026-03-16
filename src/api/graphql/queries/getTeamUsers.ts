import { UserCardProps } from "@/components/client/molecules/UserCard";

export async function getTeamUsersDummy(): Promise<UserCardProps[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
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
                    name: "Usuario 1", 
                    email: "joseherndez@muniguate.com", 
                    role: "Tecnico", 
                    avatarInitials: "G", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                        { 
                    name: "Usuario 2", 
                    email: "jehernandez@muniguate.com", 
                    role: "Tecnico", 
                    avatarInitials: "S", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                        { 
                    name: "Usuario 3", 
                    email: "josehernand@muniguate.com", 
                    role: "Desarrollador", 
                    avatarInitials: "T", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 4", 
                    email: "josehernande@muniguate.com", 
                    role: "Tecnico", 
                    avatarInitials: "P", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 5", 
                    email: "joseherande@muniguate.com", 
                    role: "Tecnico", 
                    avatarInitials: "R", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 6", 
                    email: "rqty@muniguate.com", 
                    role: "Desarrollador", 
                    avatarInitials: "L", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                }
            ])
        }, 900)
    })
};