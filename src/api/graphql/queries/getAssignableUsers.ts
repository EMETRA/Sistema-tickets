import { UserChipProps } from "@/components/client/atoms/UserChip";

export interface AssignableUser {
  id: string;
  userInfo: UserChipProps;
  workstation: string;
}

const ASSIGNABLE_USERS: AssignableUser[] = [
    {
        id: "1",
        userInfo: {
            userName: "Gildder Alberto Caceres Urizar",
            avatarProps: { initials: "G", src: "https://i.pravatar.cc/150?img=12" },
        },
        workstation: "Recursos Humanos",
    },
    {
        id: "2",
        userInfo: {
            userName: "Feyser Emilio Caceres Urizar",
            avatarProps: { initials: "F", src: "https://i.pravatar.cc/150?img=33" },
        },
        workstation: "Informatica",
    },
    {
        id: "3",
        userInfo: {
            userName: "Roger Orlando Perez",
            avatarProps: { initials: "R", src: "https://i.pravatar.cc/150?img=68" },
        },
        workstation: "Informatica",
    },
    {
        id: "4",
        userInfo: {
            userName: "Dimas Gerardo Zamora",
            avatarProps: { initials: "D", src: "https://i.pravatar.cc/150?img=14" },
        },
        workstation: "Contabilidad",
    },
    {
        id: "5",
        userInfo: {
            userName: "Jose Hernandez",
            avatarProps: { initials: "J", src: "https://i.pravatar.cc/150?img=52" },
        },
        workstation: "Juridico",
    },
    {
        id: "6",
        userInfo: {
            userName: "Maria Lopez",
            avatarProps: { initials: "M", src: "https://i.pravatar.cc/150?img=47" },
        },
        workstation: "Recursos Humanos",
    },
    {
        id: "7",
        userInfo: {
            userName: "Carlos Garcia",
            avatarProps: { initials: "C", src: "https://i.pravatar.cc/150?img=5" },
        },
        workstation: "Informatica",
    },
    {
        id: "8",
        userInfo: {
            userName: "Ana Martinez",
            avatarProps: { initials: "A", src: "https://i.pravatar.cc/150?img=15" },
        },
        workstation: "Contabilidad",
    },
    {
        id: "9",
        userInfo: {
            userName: "Luis Rodriguez",
            avatarProps: { initials: "L", src: "https://i.pravatar.cc/150?img=29" },
        },
        workstation: "Juridico",
    },
    {
        id: "10",
        userInfo: {
            userName: "Sofia Gonzalez",
            avatarProps: { initials: "S", src: "https://i.pravatar.cc/150?img=8" },
        },
        workstation: "Recursos Humanos",
    },
    {
        id: "11",
        userInfo: {
            userName: "Miguel Torres",
            avatarProps: { initials: "M", src: "https://i.pravatar.cc/150?img=22" },
        },
        workstation: "Informatica",
    },
    {
        id: "12",
        userInfo: {
            userName: "Laura Ramirez",
            avatarProps: { initials: "L", src: "https://i.pravatar.cc/150?img=19" },
        },
        workstation: "Contabilidad",
    },
    {
        id: "13",
        userInfo: {
            userName: "Diego Fernandez",
            avatarProps: { initials: "D", src: "https://i.pravatar.cc/150?img=45" },
        },
        workstation: "Juridico",
    },
    {
        id: "14",
        userInfo: {
            userName: "Valentina Sanchez",
            avatarProps: { initials: "V", src: "https://i.pravatar.cc/150?img=30" },
        },
        workstation: "Recursos Humanos",
    },
    {
        id: "15",
        userInfo: {
            userName: "Andres Ramirez",
            avatarProps: { initials: "A", src: "https://i.pravatar.cc/150?img=18" },
        },
        workstation: "Informatica",
    }
];

export async function getAssignableUsersDummy(searchTerm: string = ""): Promise<AssignableUser[]> {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return new Promise((resolve) => {
        setTimeout(() => {
            if (!normalizedSearch) {
                resolve(ASSIGNABLE_USERS);
                return;
            }

            resolve(
                ASSIGNABLE_USERS.filter((user) => {
                    const name = user.userInfo.userName.toLowerCase();
                    const workstation = user.workstation.toLowerCase();
                    return name.includes(normalizedSearch) || workstation.includes(normalizedSearch);
                })
            );
        }, 500);
    });
}
