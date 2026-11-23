"use client";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import {
    OrganizationPeople,
    type OrganizationPerson,
} from "@/components/client/organisms/OrganizationPeople/OrganizationPeople";
import { OrganizationSync } from "./OrganizationSync";
import {
    WorkspaceNavigation,
    useWorkspaceTab,
    type WorkspaceTab,
} from "./WorkspaceNavigation";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
function PeopleDirectory() {
    const [people, setPeople] = useState<OrganizationPerson[] | null>(null),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        startTransition(() => {
            setPeople(null);
            setError("");
        });
        platformFetch<{ personal: OrganizationPerson[] }>(
            "/organization/people",
            { signal: controller.signal },
        )
            .then((result) => {
                if (!controller.signal.aborted) setPeople(result.personal);
            })
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            });
        return () => controller.abort();
    }, [revision]);
    return (
        <section className={styles.listPanel}>
            <div className={styles.toolbar}>
                <div>
                    <h2>Personal de RRHH</h2>
                </div>
                <Button
                    variant="outlined"
                    onClick={() => setRevision((v) => v + 1)}
                >
                    Actualizar personal
                </Button>
            </div>
            {error ? (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            ) : people ? (
                <OrganizationPeople people={people} />
            ) : (
                <p role="status">Consultando el personal de RRHH…</p>
            )}
        </section>
    );
}
function Responsibilities() {
    const { data } = usePlatform();
    const [team, setTeam] = useState("");
    return (
        <>
            <label className={styles.search}>
                Equipo de trabajo
                <select
                    className={styles.control}
                    aria-label="Equipo de trabajo"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                >
                    <option value="">Todos mis equipos disponibles</option>
                    {data!.teams.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.nombre}
                        </option>
                    ))}
                </select>
            </label>
            <ResourceWorkspace
                key={team}
                group="organizacion"
                types={["miembros"]}
                initialType="miembros"
                hideTabs
                hideDescription
                scopeEquipoId={team || undefined}
            />
        </>
    );
}
export function OrganizationWorkspace() {
    const { data } = usePlatform();
    const [revision, setRevision] = useState(0);
    const tabs: WorkspaceTab[] = [];
    if (data?.actor.admin)
        tabs.push({
            id: "personas",
            label: "Personal de RRHH",
            description:
                "Consulta personas, puesto y unidad, y revisa sus bienes aunque todavía no tengan cuenta.",
        });
    if (data?.definitions.equipos?.actions.LEER)
        tabs.push({
            id: "equipos",
            label: "Equipos de trabajo",
            description:
                "Agrupa personas por unidad o grupo de atención. Los equipos informáticos físicos se consultan en Activos y mantenimiento.",
        });
    if (data?.definitions.miembros?.actions.LEER)
        tabs.push({
            id: "responsabilidades",
            label: "Responsabilidades",
            description:
                "Define qué función cumple cada miembro con cuenta dentro de su equipo. Los permisos del sistema se administran en Personas y accesos.",
        });
    const { current, select } = useWorkspaceTab(tabs);
    if (!current)
        return (
            <p className={styles.card}>No tienes acceso a estos registros.</p>
        );
    return (
        <section className={`${styles.page} ${styles.workspace}`}>
            <WorkspaceNavigation
                tabs={tabs}
                current={current}
                onSelect={select}
                label="Personal y equipos"
            />
            {current.id === "personas" ? (
                <PeopleDirectory />
            ) : current.id === "responsabilidades" ? (
                <Responsibilities />
            ) : (
                <>
                    {data?.actor.admin && (
                        <details className={styles.card}>
                            <summary>Sincronizar equipos desde RRHH</summary>
                            <OrganizationSync
                                onApplied={() => setRevision((v) => v + 1)}
                            />
                        </details>
                    )}
                    <ResourceWorkspace
                        key={revision}
                        group="organizacion"
                        types={["equipos"]}
                        initialType="equipos"
                        hideTabs
                        hideDescription
                    />
                </>
            )}
        </section>
    );
}
