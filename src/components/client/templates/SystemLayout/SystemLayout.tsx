"use client";

import { CreateTicketDialog } from "@/features/tickets/components/CreateTicketDialog";
import { CommandPalette, type PaletteItem } from "@/features/navegacion/components/CommandPalette";
import { PanelSidebar, type PanelLink } from "@/components/client/organisms/PanelSidebar";
import { useCommandPalette } from "@/store/useCommandPalette";
import { rememberModule } from "@/platform/recents";
import { areaAccent, areaName } from "@/config/app-areas";
import { spaceMeta } from "@/platform/spaces";
import { useAccessibilitySync, useThemeSync } from "@/platform/theme";
import { GuidedTourHost } from "@/features/recorrido/components/GuidedTour";
import { SpaceHeader } from "../../molecules/SpaceHeader";
import { useCreateTicketDialog } from "@/store/useCreateTicketDialog";
import { usePlatform } from "@/platform/context";
import { PLATFORM_SECTIONS, platformSections } from "@/platform/navigation";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../../atoms/Button";
import { HrMandatoryNotice } from "@/platform/hr-notifications";
import { TopBar } from "../../organisms/TopBar";
import { PAGES_CONFIG, getMenuByRole } from "@/config/navigation";
import { canAccessPath } from "@/config/route-access";
import { canAccessAppPath } from "@/config/apps-access";
import { resolveAppPath, getAppPathMeta, buildSectionPath, buildModulePath } from "@/config/apps-catalog";
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

export const SystemLayout = ({ children, className }: { children: React.ReactNode; className?: string }) => {
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
        requestAnimationFrame(() =>
            document.querySelector<HTMLButtonElement>('[aria-label="Menú de usuario"]')?.focus(),
        );
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
    }, [isHydrated, token, currentRole, pathname, router, catalog, catalogLoading, catalogError, appId]);

    const platform = usePlatform();
    useThemeSync();
    useAccessibilitySync();
    const showCreateTicket = useCreateTicketDialog((s) => s.show);
    const canCreateTicket = canAccessPath(currentRole, "/tickets-creation");
    const navItems = getMenuByRole(currentRole)
        .filter(
            (page) =>
                page.path !== "/tickets-creation" &&
                !(
                    page.path === "/equipo" &&
                    platform.data &&
                    platformSections(platform.data).some((s) => s.id === "organizacion")
                ) &&
                (!platform.data || !["/tickets", "/config", "/usuarios"].includes(page.path)),
        )
        .map((page) => ({
            path: page.path,
            label: page.label,
            iconName: page.iconName,
        }));
    const workspaceNavigation = platform.data
        ? workspaceViewNavigation(platform.data, workspaceView.mode)
        : null;

    // ── Navegación del Panel institucional ──
    const showPalette = useCommandPalette((s) => s.show);
    const workspaceLinks = workspaceNavigation
        ? [...workspaceNavigation.primary, ...workspaceNavigation.secondary]
        : [];
    const pick = (path: string, label?: string) => {
        const found = workspaceLinks.find((l) => l.path === path);
        return found ? [{ ...found, label: label || found.label }] : [];
    };
    const staff = !!platform.data && (platform.data.actor.admin || platform.data.actor.mode !== "USUARIO");
    const panelPrimary: PanelLink[] = [
        { path: "/home", label: "Inicio", iconName: "house-solid" },
        ...(platform.data?.capabilities.assign || platform.data?.capabilities.attend
            ? pick(
                  "/espacio/asignacion",
                  platform.data.capabilities.assign ? "Mesa de servicio" : "Mis asignados",
              )
            : []),
        { path: "/mis-tickets", label: "Mis solicitudes", iconName: "ticket-solid" },
        ...pick("/espacio/calendario"),
    ];
    const panelTools: PanelLink[] = platform.data
        ? workspaceLinks.filter(
              (l) =>
                  l.path.startsWith("/espacio/") &&
                  !panelPrimary.some((p) => p.path === l.path) &&
                  l.path !== "/espacio/calendario",
          )
        : // Sin espacio de trabajo (deshabilitado o con error): las páginas del perfil.
          platform.loading
          ? []
          : navItems.filter((item) => !["/home", "/mis-tickets", "/aplicaciones"].includes(item.path));
    const panelApps = catalog
        ? Object.values(catalog).map((app) => ({
              id: app.meta.id,
              label: areaName(app.meta.title),
              path: `/home/${app.meta.id}`,
              iconName: app.meta.iconName,
              accent: areaAccent(app.meta.id),
              sections: Object.values(app.sections).map((section) => ({
                  path: buildSectionPath(app.meta.id, section.meta.id),
                  label: section.meta.title,
                  iconName: section.meta.iconName,
              })),
          }))
        : [];
    const paletteItems: PaletteItem[] = [
        ...(canCreateTicket
            ? [
                  {
                      id: "accion-crear",
                      label: "Crear ticket",
                      hint: "Nueva solicitud a Informática",
                      group: "Acciones" as const,
                      icon: "ticket-solid",
                      run: showCreateTicket,
                      keywords: "nuevo solicitud soporte ayuda reportar",
                  },
              ]
            : []),
        ...panelPrimary.map((l) => ({
            id: "ir-" + l.path,
            label: l.label,
            group: "Ir a" as const,
            icon: l.iconName,
            href: l.path,
        })),
        ...panelTools.map((l) => ({
            id: "it-" + l.path,
            label: l.label,
            group: "Informática" as const,
            icon: l.iconName,
            href: l.path,
            hint: staff ? "Informática" : undefined,
        })),
        ...panelApps.map((a) => ({
            id: "app-" + a.id,
            label: a.label,
            hint: `${a.sections.length} secciones`,
            group: "Aplicaciones" as const,
            icon: a.iconName,
            catalogIcon: true,
            accent: a.accent,
            href: a.path,
            keywords: "aplicaciones sistema",
        })),
        ...(catalog
            ? Object.values(catalog).flatMap((app) =>
                  Object.values(app.sections).flatMap((section) => [
                      ...section.modules.map((module) => ({
                          id: `mod-${app.meta.id}-${section.meta.id}-${module.id}`,
                          label: module.title,
                          hint: `${areaName(app.meta.title)} › ${section.meta.title}`,
                          group: "Módulos" as const,
                          icon: module.iconName,
                          catalogIcon: true,
                          accent: areaAccent(app.meta.id),
                          href: buildModulePath(app.meta.id, section.meta.id, module.id),
                          keywords: `${module.label} ${app.meta.label}`,
                      })),
                  ]),
              )
            : []),
    ];
    const ticketScope = platform.data
        ? platform.data.capabilities.assign
            ? "cola"
            : platform.data.capabilities.attend
              ? "asignados"
              : "creados"
        : undefined;
    // Recientes: los módulos de aplicaciones que la persona abre.
    useEffect(() => {
        if (!catalog || !pathname) return;
        const [, home, appKey, sectionKey, moduleKey] = pathname.split("/");
        if (home !== "home" || !appKey || !sectionKey || !moduleKey) return;
        const found = catalog[appKey]?.sections[sectionKey]?.modules.find((m) => m.id === moduleKey);
        if (found)
            rememberModule({
                path: pathname,
                title: found.title,
                area: `${areaName(catalog[appKey].meta.title)} › ${catalog[appKey].sections[sectionKey].meta.title}`,
            });
    }, [catalog, pathname]);

    const activePage = (() => {
        if (!pathname) return PAGES_CONFIG.home;
        if (/^\/mis-tickets\/[^/]+$/.test(pathname))
            return { title: "Detalle del ticket", iconName: "ticket-solid" };
        const workspace = PLATFORM_SECTIONS.find((s) => pathname === "/espacio/" + s.id);
        if (workspace) return { title: workspace.label, iconName: workspace.iconName };

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

    // Encabezado de espacio (solo pantallas con propósito conocido).
    const spaceInfo = pathname ? spaceMeta(pathname, staff) : null;
    const spaceTitle =
        pathname === "/espacio/asignacion"
            ? platform.data?.capabilities.assign
                ? "Mesa de servicio"
                : "Mis asignados"
            : spaceInfo?.title || activePage.title;
    const spaceIcon =
        [...panelPrimary, ...panelTools].find((l) => l.path === pathname)?.iconName ||
        (pathname === "/aplicaciones" ? "table-cells-large-solid" : activePage.iconName);

    const hasAccess =
        Boolean(token) &&
        canAccessPath(currentRole, pathname ?? "/home") &&
        (!appId || (!catalogLoading && canAccessAppPath(pathname ?? "/home", catalog)));

    if (!isHydrated || (appId && catalogLoading)) {
        return (
            <div className={styles.loading} role="status">
                Cargando tu espacio de trabajo…
            </div>
        );
    }

    if (token && appId && catalogError && canAccessPath(currentRole, pathname ?? "/home")) {
        return (
            <div className={styles.loading}>
                <ApplicationLoadError onRetry={() => window.location.reload()} />
            </div>
        );
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <RoleProvider role={currentRole}>
            <AdministrativeConfirmation />
            <GuidedTourHost autoStart />
            {workspaceView.canChangeView && (
                <WorkspaceViewSwitcher
                    key={workspaceView.mode + String(viewDialogOpen)}
                    open={viewDialogOpen}
                    mode={workspaceView.mode}
                    onClose={closeViewDialog}
                    onApply={workspaceView.setMode}
                />
            )}
            <div data-workspace-shell className={classNames(styles.layout, className)}>
                <a href="#main-content" className={styles.skipLink}>
                    Ir al contenido
                </a>
                <PanelSidebar
                    primary={panelPrimary}
                    apps={panelApps}
                    tools={panelTools}
                    toolsLabel={
                        platform.data?.actor.admin ||
                        ["TECNICO", "DESARROLLADOR", "DEVOPS", "ASIGNACION"].includes(
                            platform.data?.actor.mode || "",
                        )
                            ? "Informática"
                            : "Herramientas"
                    }
                    activePath={pathname || "/home"}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    onLogout={logout}
                />

                <div className={styles.container}>
                    <TopBar
                        onChangeView={workspaceView.canChangeView ? () => setViewDialogOpen(true) : undefined}
                        profilePath="/mi-perfil"
                        createTicketPath={canCreateTicket ? "/tickets-creation" : undefined}
                        onSearch={showPalette}
                        onCreateTicket={pathname === "/tickets-creation" ? undefined : showCreateTicket}
                        notificationsPath="/notificaciones"
                        // Ajustes personales para todos (apariencia); la administración se enlaza desde ahí.
                        settingsPath="/ajustes"
                        unit={user?.departamento || undefined}
                        menuOpen={menuOpen}
                        onMenuClick={() => setMenuOpen((open) => !open)}
                        title={spaceInfo ? spaceTitle : activePage.title}
                        iconName={activePage.iconName}
                        userName={user?.nombre || "Usuario"}
                        userRole={
                            (workspaceView.active
                                ? WORKSPACE_VIEWS.find((view) => view.id === workspaceView.mode)?.label
                                : undefined) ||
                            user?.rol?.trim() ||
                            currentRole.charAt(0).toUpperCase() + currentRole.slice(1).toLowerCase()
                        }
                        userAvatarUrl={user?.avatar}
                        userStatus="online"
                    />

                    {workspaceView.active && (
                        <div className={styles.presentation} role="status">
                            <div>
                                <strong>
                                    Vista de presentación:{" "}
                                    {WORKSPACE_VIEWS.find((view) => view.id === workspaceView.mode)?.label}
                                </strong>
                                <span>Los datos y permisos corresponden a tu cuenta.</span>
                            </div>
                            <div>
                                <Link href="/home">Ver inicio de esta vista</Link>
                                <button type="button" onClick={() => workspaceView.setMode("ACTUAL")}>
                                    Volver a mi vista
                                </button>
                            </div>
                        </div>
                    )}

                    <HrMandatoryNotice />
                    <main id="main-content" tabIndex={-1} className={styles.main}>
                        {appContext && catalog && (
                            <nav aria-label="Ruta de navegación" className={styles.breadcrumb}>
                                <Link href="/home">Inicio</Link>
                                <span aria-hidden="true">/</span>
                                <Link href={`/home/${appContext.appId}`}>
                                    {areaName(catalog[appContext.appId]?.meta.title || "")}
                                </Link>
                                {appContext.sectionId &&
                                    (!appContext.moduleId ||
                                        catalog[appContext.appId]?.sections[appContext.sectionId]?.meta.label
                                            .trim()
                                            .toLocaleLowerCase() !==
                                            activePage.title.trim().toLocaleLowerCase()) && (
                                        <>
                                            <span aria-hidden="true">/</span>
                                            <Link
                                                href={buildSectionPath(
                                                    appContext.appId,
                                                    appContext.sectionId,
                                                )}
                                            >
                                                {
                                                    catalog[appContext.appId]?.sections[appContext.sectionId]
                                                        ?.meta.title
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
                            {!appContext &&
                                pathname !== "/home" &&
                                !/^\/mis-tickets\/[^/]+$/.test(pathname || "") &&
                                spaceInfo && (
                                    <SpaceHeader
                                        space={spaceInfo.space}
                                        title={spaceTitle}
                                        description={spaceInfo.description}
                                        iconName={spaceIcon}
                                        actions={
                                            ["/mis-tickets", "/tickets"].includes(pathname || "") &&
                                            canCreateTicket ? (
                                                <Button onClick={showCreateTicket}>+ Crear ticket</Button>
                                            ) : undefined
                                        }
                                    />
                                )}
                            {!appContext &&
                                pathname !== "/home" &&
                                !/^\/mis-tickets\/[^/]+$/.test(pathname || "") &&
                                !spaceInfo && (
                                    <PageHeading
                                        title={activePage.title}
                                        description={
                                            pathname === "/mis-tickets"
                                                ? "Solicitudes relacionadas con tu cuenta."
                                                : pathname === "/tickets"
                                                  ? "Consulta y organiza los tickets dentro de tu alcance."
                                                  : pathname === "/aplicaciones"
                                                    ? "Accesos disponibles según tu perfil."
                                                    : undefined
                                        }
                                        actions={
                                            ["/mis-tickets", "/tickets"].includes(pathname || "") &&
                                            canCreateTicket ? (
                                                <Button onClick={showCreateTicket}>+ Crear ticket</Button>
                                            ) : undefined
                                        }
                                    />
                                )}
                            <div
                                className={
                                    !appContext && pathname !== "/home" ? styles.standardContent : undefined
                                }
                            >
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            {canCreateTicket && <CreateTicketDialog />}
            <CommandPalette items={paletteItems} ticketScope={ticketScope} />
        </RoleProvider>
    );
};
