export const ACCESS_TABS = [
    { id: "corporate", label: "Funciones corporativas", description: "Consulta y gestiona las funciones de los sistemas corporativos autorizados." },
    {
        id: "users",
        label: "Usuarios",
        description:
            "Asigna un perfil base y sus excepciones o copia los accesos de otro colaborador.",
    },
    {
        id: "profiles",
        label: "Perfiles",
        description:
            "Agrupa los roles que corresponden a una función dentro de la institución.",
    },
    {
        id: "roles",
        label: "Roles",
        description: "Organiza los permisos que forman parte de cada rol.",
    },
    {
        id: "modules",
        label: "Módulos",
        description:
            "Registra los módulos de las aplicaciones y vincula sus permisos para leer, insertar, editar y eliminar.",
    },
    {
        id: "permissions",
        label: "Permisos",
        description:
            "Crea y consulta los permisos que luego se asignan a los roles o como excepciones individuales.",
    },
] as const;
export type AccessTab = (typeof ACCESS_TABS)[number]["id"];
export function accessTab(value: string | null): AccessTab {
    return ACCESS_TABS.find((tab) => tab.id === value)?.id || "users";
}
export function accessNavigation(admin: boolean) {
    return [
        ...(admin
            ? ACCESS_TABS.map((tab) => ({
                  id: tab.id,
                  label: tab.label,
                  href: "/espacio/accesos?tab=" + tab.id,
              }))
            : []),
        {
            id: "requests",
            label: "Solicitudes de acceso",
            href: "/espacio/solicitudes",
        },
    ];
}
