import { createElement } from "react";
import { notFound, redirect } from "next/navigation";
import { getModule } from "@/config/apps-catalog";
import { getAppComponent } from "@/config/app-registry";
import { requireAppCatalog } from "@/config/require-app-catalog";
import { ModuleWorkspace } from "@/components/client/templates/ModuleWorkspace/ModuleWorkspace";

type PageProps = {
    params: Promise<{ appId: string; sectionId: string; moduleId: string }>;
};

export default async function ModuleAppPage({ params }: PageProps) {
    const { appId, sectionId, moduleId } = await params;
    if (moduleId === "mod06") redirect("/espacio/accesos?tab=corporate");
    if (["mod13", "proc01"].includes(moduleId))
        redirect("/aplicaciones/en-desuso");
    const catalog = await requireAppCatalog(
        `/home/${appId}/${sectionId}/${moduleId}`,
    );

    const moduleMeta = getModule(appId, sectionId, moduleId, catalog);
    if (!moduleMeta) redirect("/unauthorized");

    const appComponent = getAppComponent(moduleId);
    if (!appComponent) return notFound();

    return (
        <ModuleWorkspace
            moduleId={moduleId}
            title={moduleMeta.title}
            showHeading={moduleId !== "noticias"}
        >
            {createElement(appComponent)}
        </ModuleWorkspace>
    );
}
