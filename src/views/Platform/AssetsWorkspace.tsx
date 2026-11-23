"use client";
import Link from "next/link";
import { usePlatform } from "@/platform/context";
import { InventoryWorkspace } from "@/components/client/organisms/ResourceWorkspace/InventoryWorkspace";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import {
    WorkspaceNavigation,
    useWorkspaceTab,
    type WorkspaceTab,
} from "./WorkspaceNavigation";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
const sections: (WorkspaceTab & { type: string })[] = [
    {
        id: "inventario",
        type: "activos",
        label: "Inventario de bienes",
        description:
            "Consulta tarjetas y bienes vigentes de Activos Fijos. Abre su ficha o prepara los datos técnicos que se gestionarán en Tickets.",
    },
    {
        id: "fichas",
        type: "activos",
        label: "Fichas técnicas",
        description:
            "Datos técnicos, ubicación y responsable de los bienes que ya se registraron en Tickets.",
    },
    {
        id: "mantenimientos",
        type: "intervenciones",
        label: "Mantenimientos y visitas",
        description:
            "Registra una revisión, reparación o visita y consulta el trabajo realizado.",
    },
    {
        id: "ubicaciones",
        type: "instalaciones",
        label: "Ubicaciones",
        description:
            "Un solo catálogo de sedes, edificios y niveles, compartido por activos y red.",
    },
    {
        id: "movimientos",
        type: "movimientos-activos",
        label: "Movimientos",
        description:
            "Documenta un traslado, salida o baja autorizada. La actualización oficial de la tarjeta se realiza en Activos Fijos.",
    },
];
export function AssetsWorkspace() {
    const { data } = usePlatform();
    const tabs = sections.filter(
        (t) =>
            data?.definitions[t.type]?.actions.LEER ||
            (t.id !== "inventario" && data?.definitions[t.type]?.actions.INSERTAR),
    );
    const { current, select, query } = useWorkspaceTab(tabs);
    const employeeText = query.get("empleado")?.trim() || "";
    const empleado = employeeText ? Number(employeeText) : undefined;
    const usuarioId = query.get("usuarioId")?.trim() || undefined;
    const equipoId = query.get("equipoId")?.trim() || undefined;
    const scoped = !!(employeeText || usuarioId || equipoId);
    if (!current)
        return (
            <p className={styles.card}>No tienes acceso a estos registros.</p>
        );
    const type = sections.find((t) => t.id === current.id)!.type;
    return (
        <section className={`${styles.page} ${styles.workspace}`}>
            <WorkspaceNavigation
                tabs={tabs}
                current={current}
                onSelect={select}
                label="Activos y mantenimiento"
            />
            {current.id === "inventario" ? (
                <>
                    {scoped && (
                        <div className={styles.toolbar}>
                            <p role="status">
                                {employeeText
                                    ? "Bienes del empleado " + employeeText
                                    : equipoId
                                      ? "Bienes del equipo seleccionado"
                                      : "Bienes del colaborador seleccionado"}
                            </p>
                            <Link
                                className={styles.link}
                                href="/espacio/inventario?view=inventario"
                            >
                                Ver inventario completo
                            </Link>
                        </div>
                    )}
                    {employeeText &&
                    (!Number.isSafeInteger(empleado) ||
                        Number(empleado) <= 0) ? (
                        <p role="alert" className={styles.error}>
                            Revisa el código de empleado del enlace.
                        </p>
                    ) : (
                        <InventoryWorkspace
                            key={[empleado, usuarioId, equipoId].join(":")}
                            type="activos"
                            empleado={empleado}
                            usuarioId={usuarioId}
                            equipoId={equipoId}
                        />
                    )}
                </>
            ) : (
                <ResourceWorkspace
                    key={type}
                    group="inventario"
                    initialType={type}
                    types={[type]}
                    hideTabs
                    hideDescription
                />
            )}
        </section>
    );
}
