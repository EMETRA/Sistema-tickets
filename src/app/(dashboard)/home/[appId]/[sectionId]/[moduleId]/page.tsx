import { createElement } from "react";
import { notFound, redirect } from "next/navigation";
import { getModule } from "@/config/apps-catalog";
import { getAppComponent } from "@/config/app-registry";
import { requireAppCatalog } from "@/config/require-app-catalog";

type PageProps = {
    params: Promise<{ appId: string; sectionId: string; moduleId: string }>;
};

export default async function ModuleAppPage({ params }: PageProps) {
    const { appId, sectionId, moduleId } = await params;
    const catalog = await requireAppCatalog(`/home/${appId}/${sectionId}/${moduleId}`);

    const moduleMeta = getModule(appId, sectionId, moduleId, catalog);
    if (!moduleMeta) redirect("/unauthorized");

    const appComponent = getAppComponent(moduleId);
    if (!appComponent) return notFound();

    return createElement(appComponent);
}
