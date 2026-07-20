"use client";

import { usePathname, useRouter } from "next/navigation";
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { TopBar } from "../../organisms/TopBar";
import { PAGES_CONFIG } from "@/config/navigation";
import { canAccessPath } from "@/config/route-access";
import styles from "./SystemLayout.module.scss";
import classNames from "classnames";
import { useEffect, useMemo } from "react";
import { RoleProvider } from "@/context/RoleContext";
import { useAuthStore } from "@/store/useAuthStore";

export const SystemLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const pathname = usePathname();
    const router = useRouter();
    const getRole = useAuthStore((state) => state.getRole);
    const user = useAuthStore((state) => state.user);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const token = useAuthStore((state) => state.token);

    const currentRole = getRole();

    useEffect(() => {
        if (!isHydrated || !pathname) return;

        if (!token) {
            router.replace("/login");
            return;
        }

        if (!canAccessPath(currentRole, pathname)) {
            router.replace("/unauthorized");
        }
    }, [isHydrated, token, currentRole, pathname, router]);

    const activePage = useMemo(() => {
        if (!pathname) return PAGES_CONFIG.home;

        const exact = Object.values(PAGES_CONFIG).find(p => p.path === pathname);
        if (exact) return exact;

        const slugMatch = Object.values(PAGES_CONFIG).find(p => pathname.startsWith(p.path) && p.path !== "/home");
        if (slugMatch) return slugMatch;

        return PAGES_CONFIG.home;
    }, [pathname]);

    if (!isHydrated) {
        return null;
    }

    if (!token || !canAccessPath(currentRole, pathname ?? "/home")) {
        return null;
    }

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
                        userRole={currentRole.charAt(0).toUpperCase() + currentRole.slice(1).toLowerCase()}
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