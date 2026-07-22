"use client";

import { usePathname, useRouter } from "next/navigation";
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { TopBar } from "../../organisms/TopBar";
import { PAGES_CONFIG, getMenuByRole } from "@/config/navigation";
import { canAccessPath } from "@/config/route-access";
import { canAccessAppPath } from "@/config/apps-access";
import {
    resolveAppPath,
    getSections,
    getAppPathMeta,
    buildSectionPath,
} from "@/config/apps-catalog";
import styles from "./SystemLayout.module.scss";
import classNames from "classnames";
import { useEffect } from "react";
import { RoleProvider } from "@/context/RoleContext";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { useAuthStore } from "@/store/useAuthStore";

export const SystemLayout = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const getRole = useAuthStore((state) => state.getRole);
    const user = useAuthStore((state) => state.user);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const token = useAuthStore((state) => state.token);
    const departamento = useAuthStore((state) => state.user?.departamento ?? null);
    const { catalog, loading: catalogLoading } = useAppsCatalogContext();

    const currentRole = getRole();
    const appContext = pathname ? resolveAppPath(pathname) : null;
    const appId = appContext?.appId;

    useEffect(() => {
        if (!isHydrated || !pathname) return;

        if (!token) {
            router.replace("/login");
            return;
        }

        if (!canAccessPath(currentRole, pathname)) {
            router.replace("/unauthorized");
            return;
        }

        if (!canAccessAppPath(departamento, pathname, catalog)) {
            router.replace("/unauthorized");
        }
    }, [isHydrated, token, currentRole, departamento, pathname, router, catalog]);

    const navItems =
        appId && catalog
            ? getSections(appId, catalog).map((section) => ({
                path: buildSectionPath(appId, section.id),
                label: section.label,
                iconName: section.iconName,
            }))
            : getMenuByRole(currentRole).map((page) => ({
                path: page.path,
                label: page.label,
                iconName: page.iconName,
            }));

    const activePage = (() => {
        if (!pathname) return PAGES_CONFIG.home;

        if (catalog) {
            const appMeta = getAppPathMeta(pathname, catalog);
            if (appMeta) {
                return {
                    title: appMeta.title,
                    iconName: appMeta.iconName,
                };
            }
        }

        const exact = Object.values(PAGES_CONFIG).find((p) => p.path === pathname);
        if (exact) return exact;

        const prefixMatch = Object.values(PAGES_CONFIG).find(
            (p) => pathname.startsWith(`${p.path}/`) && p.path !== "/home"
        );
        if (prefixMatch) return prefixMatch;

        return PAGES_CONFIG.home;
    })();

    const hasAccess =
        Boolean(token) &&
        canAccessPath(currentRole, pathname ?? "/home") &&
        canAccessAppPath(departamento, pathname ?? "/home", catalog);

    if (!isHydrated || (appId && catalogLoading && !catalog)) {
        return null;
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <RoleProvider role={currentRole}>
            <div className={classNames(styles.layout, className)}>
                <SideBarNavigation
                    items={navItems}
                    activePath={pathname ? pathname : "/home"}
                    onNavigate={(path) => router.push(path)}
                    logoIcon={appId ? "house-solid" : "ticket-solid"}
                    className={styles.sidebar}
                />

                <div className={styles.container}>
                    <TopBar
                        title={activePage.title}
                        iconName={activePage.iconName}
                        userName={user?.nombre || "Usuario"}
                        userRole={
                            currentRole.charAt(0).toUpperCase() +
                            currentRole.slice(1).toLowerCase()
                        }
                        userAvatarUrl={user?.avatar}
                        userStatus="online"
                    />

                    <main className={styles.main}>
                        <div className={styles.pageContent}>{children}</div>
                    </main>
                </div>
            </div>
        </RoleProvider>
    );
};
