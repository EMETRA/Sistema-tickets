import { createElement } from "react";
import { notFound } from "next/navigation";
import { getAppsCatalog } from "@/api/graphql/home/getAppsCatalog";
import { getModule } from "@/config/apps-catalog";
import { getAppComponent } from "@/config/app-registry";

type PageProps = {
    params: Promise<{ appId: string; sectionId: string; moduleId: string }>;
};

export default async function ModuleAppPage({ params }: PageProps) {
    const { appId, sectionId, moduleId } = await params;
    const catalog = await getAppsCatalog();

    const moduleMeta = getModule(appId, sectionId, moduleId, catalog);
    if (!moduleMeta) return notFound();

    const appComponent = getAppComponent(moduleId);
    if (!appComponent) return notFound();

    return createElement(appComponent);
}
