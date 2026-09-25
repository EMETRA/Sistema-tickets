import { notFound } from "next/navigation";
import { getAppsCatalog } from "@/api/graphql/home/getAppsCatalog";
import { getModule } from "@/config/apps-catalog";
import JUZ01Detail from "@/views/JUZ01Detail/JUZ01Detail";

type PageProps = {
    params: Promise<{ appId: string; sectionId: string; moduleId: string }>;
    searchParams: Promise<{ caseNumber?: string | string[] }>;
};

export default async function ModuleDetailPage({ params, searchParams }: PageProps) {
    const { appId, sectionId, moduleId } = await params;
    const { caseNumber } = await searchParams;
    const catalog = await getAppsCatalog();

    const moduleMeta = getModule(appId, sectionId, moduleId, catalog);
    if (!moduleMeta || moduleId !== "juz01") return notFound();

    if (typeof caseNumber !== "string" || caseNumber.trim() === "") return notFound();

    return <JUZ01Detail caseNumber={caseNumber} />;
}
