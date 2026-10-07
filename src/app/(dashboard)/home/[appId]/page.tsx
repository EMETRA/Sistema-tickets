import { redirect, notFound } from "next/navigation";
import { getMainApp, getFirstSectionId } from "@/config/apps-catalog";
import { requireAppCatalog } from "@/config/require-app-catalog";

type PageProps = {
    params: Promise<{ appId: string }>;
};

/**
 * Entrada a una app principal: redirige a la primera sección del catálogo del usuario.
 */
export default async function MainAppPage({ params }: PageProps) {
    const { appId } = await params;
    const catalog = await requireAppCatalog(`/home/${appId}`);
    const app = getMainApp(appId, catalog);

    if (!app) redirect("/unauthorized");

    const firstSectionId = getFirstSectionId(appId, catalog);
    if (!firstSectionId) return notFound();

    redirect(`/home/${appId}/${firstSectionId}`);
}
