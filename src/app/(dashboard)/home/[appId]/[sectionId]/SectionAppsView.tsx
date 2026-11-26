"use client";

import { useRouter } from "next/navigation";
import { AppsGrid } from "@/components/client/organisms/AppsGrid";
import { buildModulePath, type AppMeta } from "@/config/apps-catalog";
import { IconName } from "@/components/client/atoms/Icon/types";
import styles from "./SectionApps.module.scss";
import { AreaWorkspace } from "@/components/client/organisms/AreaWorkspace";
import { useProposalDesign } from "@/platform/proposal";

type SectionAppsViewProps = {
    appId: string;
    sectionId: string;
    title: string;
    modules: AppMeta[];
};

export function SectionAppsView({
    appId,
    sectionId,
    title,
    modules,
}: SectionAppsViewProps) {
    const router = useRouter();
    const proposal = useProposalDesign();

    const apps = modules.map((module) => ({
        icon: module.iconName as IconName,
        iconLabel: module.label,
        title: module.title,
        onButtonClick: () => {
            router.push(buildModulePath(appId, sectionId, module.id));
        },
    }));

    if (proposal) return <AreaWorkspace appId={appId} sectionId={sectionId} />;
    return (
        <div className={styles.container}>
            <AppsGrid title={title} apps={apps} />
        </div>
    );
}
