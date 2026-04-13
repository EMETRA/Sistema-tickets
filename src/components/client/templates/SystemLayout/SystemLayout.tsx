"use client";

import { usePathname, useRouter } from "next/navigation";
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { TopBar } from "../../organisms/TopBar";
import { PAGES_CONFIG, UserRole } from "@/config/navigation";
import styles from "./SystemLayout.module.scss";
import classNames from "classnames";
import { useMemo } from "react";
import { RoleProvider } from "@/context/RoleContext";
import { useAuthStore } from "@/store/useAuthStore";

export const SystemLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const pathname = usePathname();
    const router = useRouter();
    const getRole = useAuthStore((state) => state.getRole);
    const user = useAuthStore((state) => state.user);

    const currentRole = getRole().toLowerCase() as UserRole;

    // Buscamos la metadata de la página actual para el TopBar
    const activePage = useMemo(() => {
        // Buscamos en el diccionario qué página coincide con el path actual
        return Object.values(PAGES_CONFIG).find(p => p.path === pathname) || PAGES_CONFIG.home;
    }, [pathname]);

    return (
        <RoleProvider role={currentRole}>
            <div className={classNames(styles.layout, className)}>
                <SideBarNavigation 
                    role={currentRole}
                    activePath={pathname ? pathname : "/home"}
                    onNavigate={(path) => router.push(path)}
                    className={styles.sidebar} 
                />

                <div className={styles.container}>
                    <TopBar 
                        title={activePage.title}
                        iconName={activePage.iconName}
                        userName={user?.nombre || "Usuario"} 
                        userRole={currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                        userAvatarUrl={user?.avatar}
                        userStatus="online"
                    />

                    <main className={styles.main}>
                        <div className={styles.pageContent}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </RoleProvider>
    );
};