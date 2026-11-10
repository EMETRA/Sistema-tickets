"use client";
import { useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import { OrganizationPeople, type OrganizationPerson } from "@/components/client/organisms/OrganizationPeople/OrganizationPeople";
type Plan = {
    huella: string;
    empresa: number;
    sinUsuario: number;
    sinUnidad: number;
    personal: OrganizationPerson[];
    cuentaActualVinculada: boolean;
    unidades: {
        clave: string;
        nombre: string;
        empleados: number;
        usuarios: number;
    }[];
    cambios: {
        id: string;
        tipo: string;
        accion: string;
        nombre: string;
        unidad: string;
        puesto: string;
        funcion: string | null;
    }[];
};
export function OrganizationWorkspace() {
    const { data, refresh } = usePlatform();
    const [plan, setPlan] = useState<Plan | null>(null),
        [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [message, setMessage] = useState(""),
        [revision, setRevision] = useState(0);
    async function preview() {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            setPlan(await platformFetch<Plan>("/organization/preview"));
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo consultar RRHH.",
            );
        } finally {
            setBusy(false);
        }
    }
    async function apply() {
        if (!plan || busy) return;
        setBusy(true);
        setError("");
        try {
            const result = await platformCommand<{ aplicados: number }>(
                "/organization/sync",
                "POST",
                { data: { huella: plan.huella } },
                true,
                "Generar equipos y actualizar membresías desde RRHH",
            );
            setMessage(
                `${result.aplicados} cambios aplicados. La trazabilidad se conserva en el historial.`,
            );
            setPlan(null);
            setRevision((v) => v + 1);
            await refresh();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo generar los equipos.",
            );
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className={styles.page}>
            {data?.actor.admin && (
                <section
                    className={styles.card}
                    aria-label="Generación de equipos desde RRHH"
                >
                    <div className={styles.toolbar}>
                        <div>
                            <h2>Equipos desde RRHH</h2>
                            <p className={styles.muted}>
                                Una unidad institucional forma un equipo; los
                                empleados activos aparecen en la vista previa.
                                Para incorporarse como miembros con acceso necesitan una cuenta habilitada.
                            </p>
                        </div>
                        <Button
                            variant="outlined"
                            onClick={() => void preview()}
                            state={busy ? "disabled" : "default"}
                        >
                            Preparar desde RRHH
                        </Button>
                    </div>
                    <p className={styles.muted}>
                        Los puestos se muestran para revisar responsabilidades.
                        Los miembros nuevos ingresan como MIEMBRO; las jefaturas
                        y funciones especiales se revisan en la ficha del
                        miembro.
                    </p>
                    {error && (
                        <p role="alert" className={styles.error}>
                            {error}
                        </p>
                    )}
                    {message && <p role="status">{message}</p>}
                    {plan && (
                        <div className={styles.page}>
                            <p>
                                Unidades con nombre: {plan.unidades.length} · Cambios: {plan.cambios.length} · Empleados sin cuenta habilitada: {plan.sinUsuario}.
                                Las unidades identificadas se incluyen; podrán incorporarse como miembros cuando tengan cuenta habilitada.
                            </p>
                            <p className={styles.muted}>
                                La vista previa incluye altas, actualizaciones y
                                bajas de membresías gestionadas desde RRHH.
                                Conserva las membresías manuales y los equipos
                                con historial.
                            </p>
                            {!!plan.sinUnidad && <p role="status" className={styles.card}>Unidad pendiente para {plan.sinUnidad} empleados. Se conservan sus asignaciones anteriores; revisa los datos de RRHH antes de incorporarlos a un equipo.</p>}
                            {plan.cuentaActualVinculada === false && <p role="status" className={styles.card}>Tu cuenta no está vinculada a un empleado activo en esta lectura de RRHH. Para incluirte como miembro, revisa el código de empleado asociado a tu cuenta.</p>}
                            <OrganizationPeople key={plan.huella} people={plan.personal || []} />
                            <div className={styles.tableRegion}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Unidad</th>
                                            <th>Empleados activos</th>
                                            <th>Cuentas habilitadas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.unidades.map((unit) => (
                                            <tr key={unit.clave}>
                                                <td>{unit.nombre}</td>
                                                <td>{unit.empleados}</td>
                                                <td>{unit.usuarios}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div
                                className={styles.tableRegion}
                                style={{ maxHeight: 420, overflow: "auto" }}
                            >
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Acción</th>
                                            <th>Registro</th>
                                            <th>Unidad</th>
                                            <th>Puesto</th>
                                            <th>Responsabilidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.cambios.map((change, index) => (
                                            <tr key={change.id + index}>
                                                <td>{change.accion}</td>
                                                <td>{change.nombre}</td>
                                                <td>{change.unidad}</td>
                                                <td>{change.puesto || "—"}</td>
                                                <td>
                                                    {change.funcion || "Equipo"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button
                                onClick={() => void apply()}
                                state={
                                    busy
                                        ? "loading"
                                        : !plan.cambios.length
                                          ? "disabled"
                                          : "default"
                                }
                            >
                                Aplicar generación de equipos
                            </Button>
                        </div>
                    )}
                </section>
            )}
            <ResourceWorkspace key={revision} group="organizacion" />
        </section>
    );
}
