import { UserCardProps } from "@/components/client/molecules/UserCard";

export async function getTeamUsersDummy(): Promise<UserCardProps[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { 
                    name: "Gildder Alberto Caceres Urizar", 
                    email: "albertourizar94@gmail.com", 
                    role: "Administrador",
                    department: "Informatica",
                    avatarInitials: "G", 
                    status: "online", 
                    assignedCount: 100, 
                    resolvedCount: 50 
                },
                { 
                    name: "Feyzer Emilio Caceres Urizar", 
                    email: "feyzeremiliocaceres@gmail.com", 
                    role: "Desarrollador",
                    department: "Informatica",
                    avatarInitials: "F", 
                    status: "offline", 
                    assignedCount: 500, 
                    resolvedCount: 325 
                },
                { 
                    name: "Jose Hernandez", 
                    email: "josehernandez@muniguate.com", 
                    role: "Tecnico",
                    department: "Informatica",
                    avatarInitials: "J", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 1", 
                    email: "joseherndez@muniguate.com", 
                    role: "Tecnico",
                    department: "Informatica",
                    avatarInitials: "G", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 2", 
                    email: "jehernandez@muniguate.com", 
                    role: "Tecnico",
                    department: "Informatica",
                    avatarInitials: "S", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 3", 
                    email: "josehernand@muniguate.com", 
                    role: "Desarrollador",
                    department: "Informatica",
                    avatarInitials: "T", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 4", 
                    email: "josehernande@muniguate.com", 
                    role: "Tecnico",
                    department: "Informatica",
                    avatarInitials: "P", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 5", 
                    email: "joseherande@muniguate.com", 
                    role: "Tecnico",
                    department: "Informatica",
                    avatarInitials: "R", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                },
                { 
                    name: "Usuario 6", 
                    email: "rqty@muniguate.com", 
                    role: "Desarrollador",
                    department: "Informatica",
                    avatarInitials: "L", 
                    status: "online", 
                    assignedCount: 50, 
                    resolvedCount: 48 
                }
            ])
        }, 900)
    })
};