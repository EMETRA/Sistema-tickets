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
import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleProvider } from "@/context/RoleContext";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeading } from "../../molecules/PageHeading/PageHeading";
import { AdministrativeConfirmation } from "../../organisms/AdministrativeConfirmation/AdministrativeConfirmation";

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
    const logout = useAuthStore((state) => state.logout);
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
        const close = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", close);
        return () => window.removeEventListener("keydown", close);
    }, []);
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

        if (appId && catalogLoading) return;

        if (!canAccessAppPath(pathname, catalog)) {
            router.replace("/unauthorized");
        }
    }, [
        isHydrated,
        token,
        currentRole,
        pathname,
        router,
        catalog,
        catalogLoading,
        appId,
    ]);

    const navItems = getMenuByRole(currentRole)
        .filter((page) => page.path !== "/tickets-creation")
        .map((page) => ({
            path: page.path,
            label: page.label,
            iconName: page.iconName,
        }));
    const sections = appId && catalog ? getSections(appId, catalog) : [];
    const sectionItems = sections.map((section) => ({
        path: buildSectionPath(appId!, section.id),
        label: section.label,
        iconName: section.iconName,
    }));
    const applicationLinks = catalog
        ? Object.values(catalog).map((app) => ({
            id: app.meta.id,
            title: app.meta.title,
            href: `/home/${app.meta.id}`,
        }))
        : [];

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
            (p) => pathname.startsWith(`${p.path}/`) && p.path !== "/home",
        );
        if (prefixMatch) return prefixMatch;

        return PAGES_CONFIG.home;
    })();

    const hasAccess =
    Boolean(token) &&
    canAccessPath(currentRole, pathname ?? "/home") &&
    (!appId ||
      (!catalogLoading && canAccessAppPath(pathname ?? "/home", catalog)));

    if (!isHydrated || (appId && catalogLoading)) {
        return (
            <div className={styles.loading} role="status">
                Cargando tu espacio de trabajo…
            </div>
        );
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <RoleProvider role={currentRole}>
            <AdministrativeConfirmation />
            <div className={classNames(styles.layout, className)}>
                <a href="#main-content" className={styles.skipLink}>
                    Ir al contenido
                </a>
                <SideBarNavigation
                    items={navItems}
                    sectionItems={sectionItems}
                    applicationLabel={
                        appId && catalog ? catalog[appId]?.meta.label : undefined
                    }
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    onLogout={logout}
                    activePath={pathname ? pathname : "/home"}
                    onNavigate={(path) => router.push(path)}
                    logoIcon={appId ? "house-solid" : "ticket-solid"}
                    className={styles.sidebar}
                />

                <div className={styles.container}>
                    <TopBar
                        applications={applicationLinks}
                        profilePath={
                            user?.id_usuario
                                ? `/equipo/${encodeURIComponent(user.id_usuario)}`
                                : undefined
                        }
                        createTicketPath={
                            canAccessPath(currentRole, "/tickets-creation")
                                ? "/tickets-creation"
                                : undefined
                        }
                        settingsPath={
                            canAccessPath(currentRole, "/config") ? "/config" : undefined
                        }
                        unit={user?.departamento || undefined}
                        menuOpen={menuOpen}
                        onMenuClick={() => setMenuOpen((open) => !open)}
                        title={activePage.title}
                        iconName={activePage.iconName}
                        userName={user?.nombre || "Usuario"}
                        userRole={
                            user?.rol?.trim() ||
              currentRole.charAt(0).toUpperCase() +
                currentRole.slice(1).toLowerCase()
                        }
                        userAvatarUrl={user?.avatar}
                        userStatus="online"
                    />

                    <main id="main-content" tabIndex={-1} className={styles.main}>
                        {appContext && catalog && (
                            <nav
                                aria-label="Ruta de navegación"
                                className={styles.breadcrumb}
                            >
                                <Link href="/home">Inicio</Link>
                                <span aria-hidden="true">/</span>
                                <Link href={`/home/${appContext.appId}`}>
                                    {catalog[appContext.appId]?.meta.label}
                                </Link>
                                {appContext.sectionId && (
                                    <>
                                        <span aria-hidden="true">/</span>
                                        <Link
                                            href={buildSectionPath(
                                                appContext.appId,
                                                appContext.sectionId,
                                            )}
                                        >
                                            {
                                                catalog[appContext.appId]?.sections[
                                                    appContext.sectionId
                                                ]?.meta.label
                                            }
                                        </Link>
                                    </>
                                )}
                                {appContext.moduleId && (
                                    <>
                                        <span aria-hidden="true">/</span>
                                        <span aria-current="page">{activePage.title}</span>
                                    </>
                                )}
                            </nav>
                        )}
                        <div
                            className={classNames(styles.pageContent, {
                                [styles.standardPage]: !appContext && pathname !== "/home",
                            })}
                        >
                            {!appContext && pathname !== "/home" && (
                                <PageHeading title={activePage.title} />
                            )}
                            <div
                                className={
                                    !appContext && pathname !== "/home"
                                        ? styles.standardContent
                                        : undefined
                                }
                            >
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </RoleProvider>
    );
};
