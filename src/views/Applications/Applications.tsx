"use client";
import { useRouter } from "next/navigation";
import { AppsGrid } from "@/components/client/organisms/AppsGrid";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { resolveIconFile } from "@/components/client/atoms/Icon/types";
import { getMainApps } from "@/config/apps-catalog";
import { HomeState } from "../Home/HomeHeading";
import { AppsDirectory } from "@/components/client/organisms/AreaWorkspace";
import { useProposalDesign } from "@/platform/proposal";

export function Applications() {
    const router = useRouter();
    const { catalog, loading, error, refetch } = useAppsCatalogContext();
    const proposal = useProposalDesign();
    if (loading) return <HomeState loading message="Cargando aplicaciones…" />;
    if (error)
        return (
            <HomeState
                message="No se pudo cargar el catálogo de aplicaciones."
                onRetry={() => void refetch()}
            />
        );
    if (proposal && catalog && Object.keys(catalog).length)
        return <AppsDirectory catalog={catalog} />;
    return (
        <AppsGrid
            title="Aplicaciones autorizadas"
            showHeading={false}
            description=""
            apps={getMainApps(catalog || {}).map((app) => ({
                icon: resolveIconFile(app.iconName),
                iconLabel: app.label,
                title: app.title,
                onButtonClick: () => router.push(`/home/${app.id}`),
            }))}
        />
    );
}
