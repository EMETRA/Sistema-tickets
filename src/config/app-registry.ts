import {
    ProjectsBridge,
    CollaboratorsBridge,
} from "@/views/Platform/LegacyModuleBridge";
import { PayrollWorkspace } from "@/views/Platform/PayrollWorkspace";
import type { ComponentType } from "react";
import ConsultaVehiculos from "@/views/ConsultaVehiculos";

import ExportMOD01 from "@/views/ExportMOD01";
import MOD01 from "@/views/MOD01";
import MOD04 from "@/views/MOD04";
import MOD05 from "@/views/MOD05";
import MOD07 from "@/views/MOD07";
import MOD08 from "@/views/MOD08";
import MOD10 from "@/views/MOD10";
import SaveMOD01 from "@/views/SaveMOD01/ExportMOD01";

import COM03 from "@/views/COM03";
import JUZ01 from "@/views/JUZ01";

/**
 * Registro de vistas de módulos (hojas del árbol de apps).
 * La clave debe coincidir con el `id` del módulo en apps-catalog.
 */
export const APP_REGISTRY: Record<string, ComponentType> = {
    mod01: MOD01,
    mod04: MOD04,
    mod05: MOD05,
    mod07: MOD07,
    mod08: MOD08,
    mod10: MOD10,
    "rh-boletas": PayrollWorkspace,
    // COM-03: la clave es el id del módulo en la ruta /home/comunicacion/contenido/noticias
    noticias: COM03,
    "dashboard-proyectos": ProjectsBridge,
    "dashboard-colaboradores": CollaboratorsBridge,
    exportmod01: ExportMOD01,
    "save-mod01": SaveMOD01,
    "consulta-vehiculos": ConsultaVehiculos,
    juz01: JUZ01,
};

export function getAppComponent(moduleId: string): ComponentType | null {
    return APP_REGISTRY[moduleId] ?? null;
}
