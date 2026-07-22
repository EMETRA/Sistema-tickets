"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { AppsGrid } from "@/components/client/organisms/AppsGrid";
import { getSection, buildModulePath } from "@/config/apps-catalog";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { IconName } from "@/components/client/atoms/Icon/types";
import styles from "./SectionApps.module.scss";

type PageProps = {
    params: Promise<{ appId: string; sectionId: string }>;
};

export default function SectionAppsPage({ params }: PageProps) {
    const { appId, sectionId } = use(params);
    const router = useRouter();
    const { catalog, loading } = useAppsCatalogContext();

    if (loading && !catalog) {
        return <div className={styles.container}>Cargando aplicaciones...</div>;
    }

    if (!catalog) {
        notFound();
        return null;
    }

    const section = getSection(appId, sectionId, catalog);

    if (!section) {
        notFound();
    }

    const apps = section.modules.map((module) => ({
        icon: module.iconName as IconName,
        iconLabel: module.label,
        title: module.title,
        onButtonClick: () => {
            router.push(buildModulePath(appId, sectionId, module.id));
        },
    }));

    return (
        <div className={styles.container}>
            <AppsGrid title={section.meta.title} apps={apps} />
        </div>
    );
}
