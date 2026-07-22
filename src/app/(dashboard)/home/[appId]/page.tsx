import { redirect, notFound } from "next/navigation";
import { getAppsCatalog } from "@/api/graphql/home/getAppsCatalog";
import { getMainApp, getFirstSectionId } from "@/config/apps-catalog";

type PageProps = {
    params: Promise<{ appId: string }>;
};

/**
 * Entrada a una app principal: redirige a la primera sección del catálogo.
 */
export default async function MainAppPage({ params }: PageProps) {
    const { appId } = await params;
    const catalog = await getAppsCatalog();
    const app = getMainApp(appId, catalog);

    if (!app) return notFound();

    const firstSectionId = getFirstSectionId(appId, catalog);
    if (!firstSectionId) return notFound();

    redirect(`/home/${appId}/${firstSectionId}`);
}
