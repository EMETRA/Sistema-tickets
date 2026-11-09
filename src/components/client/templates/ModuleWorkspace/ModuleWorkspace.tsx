import { PageHeading } from "../../molecules/PageHeading/PageHeading";
import styles from "./ModuleWorkspace.module.scss";

/** Uses the real catalog metadata; it never invents module routes or permissions. */
export function ModuleWorkspace({
    title,
    children,
    showHeading = true,
}: {
  title: string;
  showHeading?: boolean;
  children: React.ReactNode;
}) {
    return (
        <div className={styles.workspace}>
            {showHeading && <PageHeading title={title} />}
            <div className={styles.content}>{children}</div>
        </div>
    );
}
