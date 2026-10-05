import { redirect } from "next/navigation";
import { getSection } from "@/config/apps-catalog";
import { requireAppCatalog } from "@/config/require-app-catalog";
import { SectionAppsView } from "./SectionAppsView";

type PageProps = {
    params: Promise<{ appId: string; sectionId: string }>;
};

export default async function SectionAppsPage({ params }: PageProps) {
    const { appId, sectionId } = await params;
    const catalog = await requireAppCatalog(`/home/${appId}/${sectionId}`);
    const section = getSection(appId, sectionId, catalog);

    if (!section) redirect("/unauthorized");

    return (
        <SectionAppsView
            appId={appId}
            sectionId={sectionId}
            title={section.meta.title}
            modules={section.modules}
        />
    );
}
