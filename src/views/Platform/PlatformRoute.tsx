"use client";
import { Suspense } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformSections } from "@/platform/navigation";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { SearchWorkspace } from "./SearchWorkspace";
import { CalendarWorkspace } from "./CalendarWorkspace";
import { MetricsWorkspace } from "./MetricsWorkspace";
import { AssignmentsWorkspace } from "./AssignmentsWorkspace";
import { NetworkWorkspace } from "./NetworkWorkspace";
import { AccessWorkspace } from "./AccessWorkspace";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { getModule } from "@/config/apps-catalog";
import { OrganizationWorkspace } from "./OrganizationWorkspace";
import { SystemsWorkspace } from "./SystemsWorkspace";
import { MonitoringWorkspace } from "./MonitoringWorkspace";
import { AuditWorkspace } from "./AuditWorkspace";
import { AccessNavigation } from "@/components/client/molecules/AccessNavigation/AccessNavigation";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export function PlatformRoute({ section }: { section: string }) {
    const { catalog, loading: catalogLoading } = useAppsCatalogContext();
    const { data, loading, error, disabled, refresh } = usePlatform();
    if (loading && !data)
        return (
            <p role="status" className={styles.card}>
                Cargando tu espacio de trabajo…
            </p>
        );
    if (disabled)
        return (
            <section className={styles.card}>
                <h2>Módulos pendientes de habilitación</h2>
                <p>
                    La ampliación requiere aplicar los scripts de base de datos
                    y habilitar el API. El administrador puede consultar la guía
                    de instalación.
                </p>
            </section>
        );
    if (error || !data)
        return (
            <section role="alert" className={styles.error}>
                <p>{error || "No se pudo recuperar el perfil de trabajo."}</p>
                <Button variant="outlined" onClick={() => void refresh()}>
                    Reintentar
                </Button>
            </section>
        );
    if (section === "accesos" && !data.actor.admin && catalogLoading)
        return <p role="status" className={styles.card}>Consultando tus aplicaciones autorizadas…</p>;
    if (!platformSections(data).some((s) => s.id === section) && !(section === "accesos" && catalog && getModule("informatica", "permisos", "mod06", catalog)))
        return (
            <p role="alert" className={styles.card}>
                No tienes permiso para consultar esta sección.
            </p>
        );
    switch (section) {
        case "organizacion": return <OrganizationWorkspace />;
        case "busqueda":
            return <SearchWorkspace />;
        case "calendario":
            return <CalendarWorkspace />;
        case "metricas":
            return <MetricsWorkspace />;
        case "asignacion":
            return <AssignmentsWorkspace />;
        case "red":
            return <NetworkWorkspace />;
        case "accesos":
            return (
                <Suspense
                    fallback={
                        <p role="status" className={styles.card}>
                            Consultando los accesos…
                        </p>
                    }
                >
                    <AccessWorkspace />
                </Suspense>
            );
        case "sistemas":
            return <SystemsWorkspace />;
        case "infraestructura":
            return <MonitoringWorkspace />;
        case "auditoria":
            return <AuditWorkspace />;
        case "solicitudes":
            return (
                <section className={styles.page}>
                    <AccessNavigation
                        active="requests"
                        admin={data.actor.admin}
                    />
                    {data.actor.admin && (
                        <p className={styles.muted}>
                            Revisa las solicitudes aquí o utiliza las pestañas
                            para administrar usuarios, perfiles, roles, módulos
                            y permisos.
                        </p>
                    )}
                    <ResourceWorkspace
                        group="accesos"
                        types={["solicitudes"]}
                    />
                </section>
            );
        default:
            return <ResourceWorkspace group={section} />;
    }
}
