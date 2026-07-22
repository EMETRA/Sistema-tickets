import type { AppsCatalog } from "@/config/apps-catalog";

/**
 * Catálogo dummy - CAMBIAAAAAAR
 */
export const APPS_CATALOG_DUMMY: AppsCatalog = {
    informatica: {
        meta: {
            id: "informatica",
            label: "INFORMÁTICA",
            title: "Aplicaciones de Informática",
            iconName: "network-wired-solid",
        },
        sections: {
            reportes: {
                meta: {
                    id: "reportes",
                    label: "REPORTES",
                    title: "Reportes",
                    iconName: "chart-pie-solid",
                },
                modules: [
                    {
                        id: "mod01",
                        label: "MOD01",
                        title: "Reporte semanal informática",
                        iconName: "clipboard-solid",
                    },
                    {
                        id: "exportmod01",
                        label: "EXPORT MOD01",
                        title: "Exportar reporte semanal informática",
                        iconName: "layer-group-solid",
                    },
                    {
                        id: "save-mod01",
                        label: "SAVE MOD01",
                        title: "Reporte Guardado",
                        iconName: "clipboard-solid",
                    },
                    {
                        id: "dashboard-proyectos",
                        label: "DASHBOARD PROYECTOS",
                        title: "Dashboard de indicadores - Informática",
                        iconName: "chart-bar-solid",
                    },
                    {
                        id: "dashboard-colaboradores",
                        label: "DASHBOARD COLABORADORES",
                        title: "Dashboard por colaborador - Informática",
                        iconName: "chart-bar-solid",
                    },
                ],
            },
            permisos: {
                meta: {
                    id: "permisos",
                    label: "PERMISOS",
                    title: "Permisos",
                    iconName: "user-solid",
                },
                modules: [
                    {
                        id: "mod06",
                        label: "MOD06",
                        title: "Asignación de permisos por usuario",
                        iconName: "layer-group-solid",
                    },
                ],
            },
            manuales: {
                meta: {
                    id: "manuales",
                    label: "MANUALES",
                    title: "Manuales",
                    iconName: "clipboard-solid",
                },
                modules: [
                    {
                        id: "mod07",
                        label: "MOD07",
                        title: "Visor de manuales de usuario | EMETRA",
                        iconName: "chart-bar-solid",
                    },
                ],
            },
        },
    },
    rrhh: {
        meta: {
            id: "rrhh",
            label: "RRHH",
            title: "Aplicaciones de Recursos Humanos",
            iconName: "people-group-solid",
        },
        sections: {
            formularios: {
                meta: {
                    id: "formularios",
                    label: "FORMULARIOS",
                    title: "Formularios",
                    iconName: "clipboard-list-solid",
                },
                modules: [
                    {
                        id: "mod04",
                        label: "MOD04",
                        title: "Formulario reporte de visa nóminas",
                        iconName: "layer-group-solid",
                    },
                    {
                        id: "mod05",
                        label: "MOD05",
                        title: "Reporte general RRHH - EMETRA",
                        iconName: "layer-group-solid",
                    },
                ],
            },
        },
    },
    recaudacion: {
        meta: {
            id: "recaudacion",
            label: "RECAUDACIÓN",
            title: "Aplicaciones de Recaudación",
            iconName: "chart-bar-solid",
        },
        sections: {
            procesos: {
                meta: {
                    id: "procesos",
                    label: "PROCESOS",
                    title: "Procesos",
                    iconName: "person-chalkboard-solid",
                },
                modules: [
                    {
                        id: "proc01",
                        label: "PROC01",
                        title: "Proceso de grabación unificada de remisiones de cámara LPR",
                        iconName: "chart-bar-solid",
                    },
                ],
            },
            proyectos: {
                meta: {
                    id: "proyectos",
                    label: "PROYECTOS",
                    title: "Proyectos",
                    iconName: "chart-bar-regular",
                },
                modules: [
                    {
                        id: "mod13",
                        label: "MOD13",
                        title: "Módulo de proyectos",
                        iconName: "clipboard-solid",
                    },
                ],
            },
        },
    },
    financiero: {
        meta: {
            id: "financiero",
            label: "FINANCIERO",
            title: "Aplicaciones de Financiero",
            iconName: "chart-simple-solid",
        },
        sections: {
            formularios: {
                meta: {
                    id: "formularios",
                    label: "FORMULARIOS",
                    title: "Formularios",
                    iconName: "clipboard-list-solid",
                },
                modules: [
                    {
                        id: "mod08",
                        label: "MOD08",
                        title: "Generador de Reportes Sistema Financiero - Recibos/Tickets anulados",
                        iconName: "clipboard-solid",
                    },
                ],
            },
        },
    },
    juridico: {
        meta: {
            id: "juridico",
            label: "JURÍDICO",
            title: "Aplicaciones de Jurídico",
            iconName: "clipboard-solid",
        },
        sections: {
            reportes: {
                meta: {
                    id: "reportes",
                    label: "REPORTES",
                    title: "Reportes",
                    iconName: "chart-pie-solid",
                },
                modules: [
                    {
                        id: "mod10",
                        label: "MOD10",
                        title: "Formulario reporte de visa nóminas",
                        iconName: "chart-bar-solid",
                    },
                ],
            },
        },
    },
};
