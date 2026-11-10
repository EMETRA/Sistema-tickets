import { PageHeading } from "../../molecules/PageHeading/PageHeading";
import styles from "./ModuleWorkspace.module.scss";
import { ModuleAccessGate } from "@/components/client/organisms/ModuleAccessGate/ModuleAccessGate";

/** Uses the real catalog metadata; it never invents module routes or permissions. */
export function ModuleWorkspace({
    title,
    children,
    showHeading = true,
    moduleId,
}: {
    title: string;
    showHeading?: boolean;
    children: React.ReactNode;
    moduleId: string;
}) {
    return (
        <div className={styles.workspace}>
            {showHeading && <PageHeading title={title} />}
            <div className={styles.content}>
                <ModuleAccessGate key={moduleId} moduleId={moduleId}>
                    {children}
                </ModuleAccessGate>
            </div>
        </div>
    );
}
