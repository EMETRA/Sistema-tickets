import { notFound, redirect } from "next/navigation";
import { getModule } from "@/config/apps-catalog";
import { requireAppCatalog } from "@/config/require-app-catalog";
import JUZ01Detail from "@/views/JUZ01Detail/JUZ01Detail";

type PageProps = {
    params: Promise<{ appId: string; sectionId: string; moduleId: string }>;
    searchParams: Promise<{ caseNumber?: string | string[] }>;
};

export default async function ModuleDetailPage({ params, searchParams }: PageProps) {
    const { appId, sectionId, moduleId } = await params;
    const { caseNumber } = await searchParams;
    const catalog = await requireAppCatalog(
        `/home/${appId}/${sectionId}/${moduleId}/detail`
    );

    const moduleMeta = getModule(appId, sectionId, moduleId, catalog);
    if (!moduleMeta) redirect("/unauthorized");

    if (moduleId !== "juz01") return notFound();

    if (typeof caseNumber !== "string" || caseNumber.trim() === "") return notFound();

    return <JUZ01Detail caseNumber={caseNumber} />;
}
