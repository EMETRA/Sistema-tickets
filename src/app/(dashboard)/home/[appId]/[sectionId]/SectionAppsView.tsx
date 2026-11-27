"use client";

import type { AppMeta } from "@/config/apps-catalog";
import { AreaWorkspace } from "@/components/client/organisms/AreaWorkspace";

type SectionAppsViewProps = {
    appId: string;
    sectionId: string;
    title: string;
    modules: AppMeta[];
};

/** Sección de un área: la presenta AreaWorkspace (módulos, recientes y accesos). */
export function SectionAppsView({ appId, sectionId }: SectionAppsViewProps) {
    return <AreaWorkspace appId={appId} sectionId={sectionId} />;
}
