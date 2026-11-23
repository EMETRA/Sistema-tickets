"use client";

import { usePlatform } from "@/platform/context";
import { PLATFORM_SECTIONS, platformSections } from "@/platform/navigation";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../../atoms/Button";
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { HrMandatoryNotice } from "@/platform/hr-notifications";
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
import { ApplicationLoadError } from "../../organisms/ApplicationLoadError/ApplicationLoadError";
import { PageHeading } from "../../molecules/PageHeading/PageHeading";
import { AdministrativeConfirmation } from "../../organisms/AdministrativeConfirmation/AdministrativeConfirmation";
import { useWorkspaceView } from "@/platform/presentation-context";
import { WORKSPACE_VIEWS, workspaceViewNavigation } from "@/platform/presentation";
import { WorkspaceViewSwitcher } from "../../organisms/WorkspaceViewSwitcher/WorkspaceViewSwitcher";

export const SystemLayout = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const pathname = usePathname();
    const router = useRouter();
    useEffect(() => {
        document.getElementById("main-content")?.scrollTo({ top: 0, left: 0 });
    }, [pathname]);
    const getRole = useAuthStore((state) => state.getRole);
    const user = useAuthStore((state) => state.user);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const token = useAuthStore((state) => state.token);
    const logout = useAuthStore((state) => state.logout);
    const [menuOpen, setMenuOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const workspaceView = useWorkspaceView();
    const closeViewDialog = () => {
        setViewDialogOpen(false);
        requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[aria-label="Menú de usuario"]')?.focus());
    };
    useEffect(() => {
        const close = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", close);
        return () => window.removeEventListener("keydown", close);
    }, []);
    const { catalog, loading: catalogLoading, error: catalogError } = useAppsCatalogContext();

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

        if (appId && (catalogLoading || catalogError)) return;

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
        catalogError,
        appId,
    ]);

    const platform = usePlatform();
    const navItems = getMenuByRole(currentRole)
        .filter(
            (page) =>
                page.path !== "/tickets-creation" &&
                !(page.path === "/equipo" && platform.data && platformSections(platform.data).some(s=>s.id === "organizacion")) &&
                (!platform.data ||
                    !["/tickets", "/config", "/usuarios"].includes(page.path)),
        )
        .map((page) => ({
            path: page.path,
            label: page.label,
            iconName: page.iconName,
        }));
    const workspaceNavigation = platform.data ? workspaceViewNavigation(platform.data, workspaceView.mode) : null;
    const secondaryItems = workspaceNavigation ? [
        ...workspaceNavigation.secondary,
        ...navItems.filter(item=>!workspaceView.active && !workspaceNavigation.primary.some(p=>p.path===item.path)
            && !workspaceNavigation.secondary.some(p=>p.path===item.path)),
    ] : [];
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
        if (/^\/mis-tickets\/[^/]+$/.test(pathname))
            return { title: "Detalle del ticket", iconName: "ticket-solid" };
        const workspace = PLATFORM_SECTIONS.find(
            (s) => pathname === "/espacio/" + s.id,
        );
        if (workspace)
            return { title: workspace.label, iconName: workspace.iconName };

        if (catalog) {
            const appMeta = getAppPathMeta(pathname, catalog);
            if (appMeta) {
                return {
                    title: appMeta.title,
                    iconName: appMeta.iconName,
                };
            }
        }

        const exact = Object.values(PAGES_CONFIG).find(
            (p) => p.path === pathname,
        );
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
            (!catalogLoading &&
                canAccessAppPath(pathname ?? "/home", catalog)));

    if (!isHydrated || (appId && catalogLoading)) {
        return (
            <div className={styles.loading} role="status">
                Cargando tu espacio de trabajo…
            </div>
        );
    }

    if (token && appId && catalogError && canAccessPath(currentRole, pathname ?? "/home")) {
        return <div className={styles.loading}><ApplicationLoadError onRetry={() => window.location.reload()} /></div>;
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <RoleProvider role={currentRole}>
            <AdministrativeConfirmation />
            {workspaceView.canChangeView && <WorkspaceViewSwitcher key={workspaceView.mode + String(viewDialogOpen)}
                open={viewDialogOpen} mode={workspaceView.mode} onClose={closeViewDialog}
                onApply={workspaceView.setMode} />}
            <div data-workspace-shell className={classNames(styles.layout, className)}>
                <a href="#main-content" className={styles.skipLink}>
                    Ir al contenido
                </a>
                <SideBarNavigation
                    items={workspaceNavigation?.primary || navItems}
                    secondaryItems={secondaryItems}
                    helpPath="/ayuda"
                    sectionItems={sectionItems}
                    applicationLabel={
                        appId && catalog
                            ? catalog[appId]?.meta.label
                            : undefined
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
                        onChangeView={workspaceView.canChangeView ? () => setViewDialogOpen(true) : undefined}
                        applications={applicationLinks}
                        profilePath="/mi-perfil"
                        createTicketPath={
                            canAccessPath(currentRole, "/tickets-creation")
                                ? "/tickets-creation"
                                : undefined
                        }
                        notificationsPath="/notificaciones"
                        settingsPath={
                            workspaceView.active ? undefined : platform.data
                                ? platform.data.actor.admin
                                    ? "/espacio/accesos"
                                    : undefined
                                : canAccessPath(currentRole, "/config")
                                    ? "/config"
                                    : undefined
                        }
                        unit={user?.departamento || undefined}
                        menuOpen={menuOpen}
                        onMenuClick={() => setMenuOpen((open) => !open)}
                        title={activePage.title}
                        iconName={activePage.iconName}
                        userName={user?.nombre || "Usuario"}
                        userRole={
                            (workspaceView.active ? WORKSPACE_VIEWS.find((view) => view.id === workspaceView.mode)?.label : undefined) || user?.rol?.trim() ||
                            currentRole.charAt(0).toUpperCase() +
                                currentRole.slice(1).toLowerCase()
                        }
                        userAvatarUrl={user?.avatar}
                        userStatus="online"
                    />

                    {workspaceView.active && <div className={styles.presentation} role="status">
                        <div><strong>Vista de presentación: {WORKSPACE_VIEWS.find((view) => view.id === workspaceView.mode)?.label}</strong>
                            <span>Los datos y permisos corresponden a tu cuenta.</span></div>
                        <div><Link href="/home">Ver inicio de esta vista</Link>
                            <button type="button" onClick={() => workspaceView.setMode("ACTUAL")}>Volver a mi vista</button></div>
                    </div>}

                    <HrMandatoryNotice />
                    <main
                        id="main-content"
                        tabIndex={-1}
                        className={styles.main}
                    >
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
                                {appContext.sectionId && (!appContext.moduleId ||
                                    catalog[appContext.appId]?.sections[appContext.sectionId]?.meta.label.trim().toLocaleLowerCase() !== activePage.title.trim().toLocaleLowerCase()) && (
                                    <>
                                        <span aria-hidden="true">/</span>
                                        <Link
                                            href={buildSectionPath(
                                                appContext.appId,
                                                appContext.sectionId,
                                            )}
                                        >
                                            {
                                                catalog[appContext.appId]
                                                    ?.sections[
                                                        appContext.sectionId
                                                    ]?.meta.label
                                            }
                                        </Link>
                                    </>
                                )}
                                {appContext.moduleId && (
                                    <>
                                        <span aria-hidden="true">/</span>
                                        <span aria-current="page">
                                            {activePage.title}
                                        </span>
                                    </>
                                )}
                            </nav>
                        )}
                        <div
                            className={classNames(styles.pageContent, {
                                [styles.standardPage]:
                                    !appContext && pathname !== "/home",
                            })}
                        >
                            {!appContext && pathname !== "/home" && !/^\/mis-tickets\/[^/]+$/.test(pathname || "") && (
                                <PageHeading title={activePage.title}
                                    description={pathname === "/mis-tickets" ? "Solicitudes relacionadas con tu cuenta." : pathname === "/tickets" ? "Consulta y organiza los tickets dentro de tu alcance." : pathname === "/aplicaciones" ? "Accesos disponibles según tu perfil." : undefined}
                                    actions={["/mis-tickets", "/tickets"].includes(pathname || "") && canAccessPath(currentRole, "/tickets-creation") ? <Button onClick={() => router.push("/tickets-creation")}>+ Crear ticket</Button> : undefined}
                                />
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
