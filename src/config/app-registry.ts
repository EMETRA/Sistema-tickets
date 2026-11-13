import { TransitReprintsWorkspace } from '@/views/Platform/TransitReprintsWorkspace';
import { ViviReportsWorkspace } from "@/views/Platform/ViviReportsWorkspace";
import { PayrollWorkspace } from "@/views/Platform/PayrollWorkspace";
import { HrCampaignsWorkspace } from "@/views/Platform/HrCampaignsWorkspace";
import type { ComponentType } from "react";
import ConsultaVehiculos from "@/views/ConsultaVehiculos";

import MOD04 from "@/views/MOD04";
import MOD05 from "@/views/MOD05";
import MOD07 from "@/views/MOD07";
import MOD08 from "@/views/MOD08";
import MOD10 from "@/views/MOD10";

import COM03 from "@/views/COM03";
import JUZ01 from "@/views/JUZ01";

/**
 * Registro de vistas de módulos (hojas del árbol de apps).
 * La clave debe coincidir con el `id` del módulo en apps-catalog.
 */
export const APP_REGISTRY: Record<string, ComponentType> = {
    mod04: MOD04,
    mod05: MOD05,
    mod07: MOD07,
    mod08: MOD08,
    mod10: MOD10,
    "rh-boletas": PayrollWorkspace,
    "rh-datos": HrCampaignsWorkspace,
    "vivi-reportes": ViviReportsWorkspace,
    // COM-03: la clave es el id del módulo en la ruta /home/comunicacion/contenido/noticias
    noticias: COM03,
    "consulta-vehiculos": ConsultaVehiculos,
    juz01: JUZ01,
    juz02: TransitReprintsWorkspace,
};

export function getAppComponent(moduleId: string): ComponentType | null {
    return APP_REGISTRY[moduleId] ?? null;
}
