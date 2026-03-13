
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { TopBar } from "../../organisms/TopBar";
import styles from "./SystemLayout.module.scss";
import classNames from "classnames";
import { SystemLayoutProps } from "./types";

export const SystemLayout = ({
    children,
    sidebarProps,
    topBarProps,
    className
}: SystemLayoutProps) => {
    return (
        <div className={classNames(styles.layout, className)}>
            {/* 1. Sidebar Fijo a la izquierda */}
            <SideBarNavigation {...sidebarProps} className={styles.sidebar} />

            <div className={styles.container}>
                {/* 2. TopBar en la parte superior del contenido */}
                <TopBar {...topBarProps} />

                {/* 3. Área de scroll para las páginas */}
                <main className={styles.main}>
                    <div className={styles.pageContent}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SystemLayout;