"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import { InventoryCatalog } from "./InventoryPicker";
import { RecordFiles } from "./RecordFiles";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
export function displayDate(value: unknown) {
    if (!value) return "No disponible";
    const text = String(value);
    if (/^\d{4}-\d\d-\d\d$/.test(text))
        return text.split("-").reverse().join("/");
    const d = new Date(text);
    return Number.isFinite(+d)
        ? new Intl.DateTimeFormat("es-GT", {
              timeZone: "America/Guatemala",
              dateStyle: "medium",
              timeStyle: "short",
          }).format(d)
        : text;
}
function display(value: unknown) {
    if (value === null || value === undefined || value === "")
        return "No disponible";
    if (typeof value === "boolean") return value ? "Sí" : "No";
    return Array.isArray(value)
        ? value.join(", ")
        : String(value).replaceAll("_", " ");
}
type RequestPreview = {
    accessVersion: number;
    agregar: { id: number; nombre: string }[];
    retirar: { id: number; nombre: string }[];
    copiaIndependiente: boolean;
};
type Change = {
    id: string;
    actor: string;
    accion: string;
    fecha: string;
    resultado: string;
    antes: unknown;
    despues: unknown;
};
export function RecordDetail({
    type,
    record,
    onClose,
    onEdit,
    onChanged,
}: {
    type: string;
    record: PlatformRecord;
    onClose: () => void;
    onEdit: (record: PlatformRecord) => void;
    onChanged: () => void;
}) {
    const { data } = usePlatform(),
        def = data!.definitions[type],
        dialog = useRef<HTMLDialogElement>(null),
        [current, setCurrent] = useState<
            PlatformRecord & {
                labels?: Record<string, string>;
                invitacion?: {
                    estado: string;
                    intentadoEn: string | null;
                    enviadoEn: string | null;
                };
            }
        >(record),
        [history, setHistory] = useState<Change[]>([]),
        [tab, setTab] = useState("info"),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [decision, setDecision] = useState("APROBAR"),
        [observacion, setObservacion] = useState("");
    const readOnly =
        type === "actividades" &&
        current.visibilidad === "EMPRESA" &&
        !data!.actor.admin;
    const employment = current.datos._rrhh as { unidad?: string; puesto?: string } | undefined;
    const automatic = current.datos._automatico as { cantidad?: number; primeraVez?: string; ultimaVez?: string } | undefined;
    useEffect(() => {
        dialog.current?.showModal();
        const controller = new AbortController();
        platformFetch<PlatformRecord>("/records/" + type + "/" + record.id, {
            signal: controller.signal,
        })
            .then(setCurrent)
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            });
        return () => controller.abort();
    }, [type, record.id]);
    useEffect(() => {
        if (tab !== "history") return;
        const controller = new AbortController();
        platformFetch<Change[]>(
            "/records/" + type + "/" + record.id + "/history",
            {
                signal: controller.signal,
            },
        )
            .then(setHistory)
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            });
        return () => controller.abort();
    }, [type, record.id, tab]);
    const [preview, setPreview] = useState<RequestPreview | null>(null);
    useEffect(() => {
        if (
            type !== "solicitudes" ||
            !data!.actor.admin ||
            current.estado !== "PENDIENTE"
        )
            return;
        const controller = new AbortController();
        platformFetch<RequestPreview>("/requests/" + current.id + "/preview", {
            signal: controller.signal,
        })
            .then(setPreview)
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            });
        return () => controller.abort();
    }, [type, data, current.id, current.estado]);
    async function remove() {
        setBusy(true);
        setError("");
        try {
            await platformCommand(
                "/records/" + type + "/" + current.id,
                "DELETE",
                { version: current.version },
                data!.actor.admin,
                "Retirar " + current.nombre + " conservando la trazabilidad",
            );
            onChanged();
            onClose();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo retirar el registro.",
            );
        } finally {
            setBusy(false);
        }
    }
    async function decide() {
        setBusy(true);
        setError("");
        try {
            const accessVersion = preview?.accessVersion;
            const updated = await platformCommand<PlatformRecord>(
                "/requests/" + current.id + "/decision",
                "POST",
                {
                    version: current.version,
                    decision,
                    observacion,
                    ...(accessVersion ? { accessVersion } : {}),
                },
                true,
                "Resolver solicitud: " + current.nombre,
            );
            setCurrent(updated);
            onChanged();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo resolver la solicitud.",
            );
        } finally {
            setBusy(false);
        }
    }
    async function provision() {
        setBusy(true);
        setError("");
        try {
            await platformCommand(
                "/requests/" + current.id + "/provision",
                "POST",
                { version: current.version },
                true,
                "Crear la cuenta aprobada de " + current.nombre,
            );
            setCurrent(
                await platformFetch<PlatformRecord>(
                    "/records/" + type + "/" + current.id,
                ),
            );
            onChanged();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo crear la cuenta; la aprobación se conserva.",
            );
        } finally {
            setBusy(false);
        }
    }
    return (
        <dialog
            ref={dialog}
            className={styles.dialog}
            aria-labelledby="record-detail-title"
            onCancel={(e) => {
                e.preventDefault();
                if (!busy) onClose();
            }}
        >
            <div className={styles.dialogHeader}>
                <h2 id="record-detail-title">{current.nombre}</h2>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    state={busy ? "disabled" : "default"}
                >
                    Cerrar
                </Button>
            </div>
            <div className={styles.dialogBody}>
                <div className={styles.toolbar}>
                    <span className={styles.chip}>
                        {current.estado.replaceAll("_", " ")}
                    </span>
                    <div className={styles.actions}>
                        {!readOnly && def.actions.EDITAR && (
                            <Button
                                variant="outlined"
                                onClick={() => onEdit(current)}
                            >
                                Editar
                            </Button>
                        )}
                        {!readOnly && def.actions.ELIMINAR && !current.datos._rrhh && (
                            <Button
                                variant="outlined"
                                onClick={() => void remove()}
                                state={busy ? "loading" : "default"}
                            >
                                Retirar
                            </Button>
                        )}
                    </div>
                </div>
                {type === "equipos" && data?.definitions.activos?.actions.LEER && <InventoryCatalog key={current.id} equipoId={current.id} title="Bienes asignados al personal del equipo"/>}
                {type === "miembros" && current.usuarioId && data?.definitions.activos?.actions.LEER && <InventoryCatalog key={current.id} usuarioId={String(current.usuarioId)} title="Bienes asignados al miembro"/>}
                {readOnly && (
                    <p className={styles.muted}>
                        Este registro está disponible solo para consulta.
                    </p>
                )}
                <nav className={styles.tabs} aria-label="Detalle del registro">
                    {[
                        ["info", "Información"],
                        ["files", "Documentos"],
                        ["history", "Historial"],
                    ].map(([id, label]) => (
                        <button
                            key={id}
                            aria-current={tab === id ? "page" : undefined}
                            onClick={() => setTab(id)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
                {error && (
                    <p role="alert" className={styles.error}>
                        {error}
                    </p>
                )}
                {tab === "files" ? (
                    <RecordFiles
                        type={type}
                        record={current}
                        readOnly={readOnly}
                    />
                ) : tab === "history" ? (
                    <section className={styles.card}>
                        <h3>Historial de cambios</h3>
                        <ul className={styles.timeline}>
                            {history.map((item) => (
                                <li key={item.id}>
                                    <strong>
                                        {item.accion.replaceAll("_", " ")} ·{" "}
                                        {item.resultado}
                                    </strong>
                                    <p className={styles.muted}>
                                        {item.actor} · {displayDate(item.fecha)}
                                    </p>
                                    <details>
                                        <summary>
                                            Ver cambios registrados
                                        </summary>
                                        <div className={styles.grid}>
                                            {[
                                                ["Antes", item.antes],
                                                ["Después", item.despues],
                                            ].map(([name, value]) => (
                                                <div key={String(name)}>
                                                    <h4>{String(name)}</h4>
                                                    <pre className={styles.log}>
                                                        {JSON.stringify(
                                                            value,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </li>
                            ))}
                        </ul>
                        {!history.length && (
                            <p className={styles.muted}>
                                No hay movimientos adicionales registrados.
                            </p>
                        )}
                    </section>
                ) : (
                    <>
                        <section className={styles.card}>
                            {type === 'incidencias' && automatic && <div><h3>Detectada automáticamente</h3><p>Ocurrencias: {automatic.cantidad} · Primera detección: {displayDate(automatic.primeraVez)} · Última detección: {displayDate(automatic.ultimaVez)}</p></div>}
                            {employment && <div className={styles.card}><h3>Datos de RRHH</h3><p className={styles.muted}>Unidad institucional: {type === "equipos" ? current.nombre : data!.teams.find(t => t.id === current.equipoId)?.nombre || "Consulta la ficha del equipo"}. El puesto se actualiza al generar equipos desde RRHH.</p>{employment.puesto && <p><strong>Puesto: </strong>{employment.puesto}</p>}</div>}
                            {["activos","dispositivos"].includes(type) && !!current.datos._inventario && <section className={styles.card}><h3>Asignación institucional</h3><p>Tarjeta: {String((current.datos._inventario as {tarjeta?:string}).tarjeta||'')}</p><p>Empleado: {String((current.datos._inventario as {nombreEmpleado?:string}).nombreEmpleado||'')} · {String((current.datos._inventario as {empleado?:number}).empleado||'')}</p><p className={styles.muted}>La tarjeta se consulta en el inventario institucional. El responsable técnico de esta ficha se gestiona por separado.</p></section>}
                            {["activos", "dispositivos"].includes(type) &&
                                !current.datos.inventarioReferencia && (
                                    <p className={styles.error}>
                                        Este registro aún no está vinculado a una tarjeta de responsabilidad institucional.
                                    </p>
                                )}
                            <dl className={styles.detail}>
                                <div>
                                    <dt>Equipo</dt>
                                    <dd>
                                        {data!.teams.find(
                                            (t) => t.id === current.equipoId,
                                        )?.nombre ||
                                            "Administración institucional"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Actualizado</dt>
                                    <dd>
                                        {displayDate(current.actualizadoEn)}
                                    </dd>
                                </div>
                                {def.fields
                                    .filter(
                                        (f) =>
                                            ![
                                                "x",
                                                "y",
                                                "planoX",
                                                "planoY",
                                            ].includes(f.key),
                                    )
                                    .map((field) => (
                                        <div key={field.key}>
                                            <dt>{field.label}</dt>
                                            <dd>
                                                {current.labels?.[field.key] ||
                                                    ([
                                                        "date",
                                                        "datetime",
                                                    ].includes(field.type)
                                                        ? displayDate(
                                                              current.datos[
                                                                  field.key
                                                              ],
                                                          )
                                                        : display(
                                                              current.datos[
                                                                  field.key
                                                              ],
                                                          ))}
                                            </dd>
                                        </div>
                                    ))}
                            </dl>
                        </section>
                        {type === "solicitudes" && (
                            <section className={styles.card}>
                                <h3>Seguimiento de la solicitud</h3>
                                {preview && (
                                    <section>
                                        <h4>
                                            Impacto de aprobar los accesos
                                            solicitados
                                        </h4>
                                        <p className={styles.muted}>
                                            {preview.agregar.length} permisos se
                                            agregan · {preview.retirar.length}{" "}
                                            se retiran.
                                            {preview.copiaIndependiente
                                                ? " La copia quedará independiente de cambios futuros del origen."
                                                : ""}
                                        </p>
                                        <details>
                                            <summary>
                                                Ver permisos afectados
                                            </summary>
                                            {preview.agregar.map((p) => (
                                                <p key={"a" + p.id}>
                                                    Agregar: {p.nombre}
                                                </p>
                                            ))}
                                            {preview.retirar.map((p) => (
                                                <p key={"r" + p.id}>
                                                    Retirar: {p.nombre}
                                                </p>
                                            ))}
                                        </details>
                                    </section>
                                )}
                                {current.invitacion && (
                                    <p className={styles.muted}>
                                        Invitación por correo:{" "}
                                        {current.invitacion.estado}.{" "}
                                        {current.invitacion.estado === "ENVIADA"
                                            ? "El servidor de correo aceptó el envío; esto no confirma lectura del destinatario."
                                            : current.invitacion.estado ===
                                                "INCIERTO"
                                              ? "El resultado requiere comprobación antes de reenviar."
                                              : "La cuenta ya existe; el envío de invitación se procesa por separado."}
                                    </p>
                                )}
                                {Boolean(current.datos.observacion) && (
                                    <p>{String(current.datos.observacion)}</p>
                                )}
                                {Boolean(current.datos.usuarioCreadoId) && (
                                    <p>
                                        Cuenta creada · Usuario{" "}
                                        {String(current.datos.usuarioCreadoId)}
                                    </p>
                                )}
                                {data!.actor.admin &&
                                    current.estado === "PENDIENTE" && (
                                        <div className={styles.page}>
                                            <label className={styles.field}>
                                                Decisión
                                                <select
                                                    className={styles.control}
                                                    value={decision}
                                                    onChange={(e) =>
                                                        setDecision(
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="APROBAR">
                                                        Aprobar y aplicar los
                                                        accesos solicitados
                                                    </option>
                                                    <option value="RECHAZAR">
                                                        Rechazar
                                                    </option>
                                                </select>
                                            </label>
                                            <label className={styles.field}>
                                                Fundamento
                                                <textarea
                                                    className={styles.control}
                                                    value={observacion}
                                                    onChange={(e) =>
                                                        setObservacion(
                                                            e.target.value,
                                                        )
                                                    }
                                                    minLength={5}
                                                    maxLength={2000}
                                                />
                                            </label>
                                            <Button
                                                onClick={() => void decide()}
                                                state={
                                                    busy
                                                        ? "loading"
                                                        : observacion.trim()
                                                                .length < 5
                                                          ? "disabled"
                                                          : "default"
                                                }
                                            >
                                                Confirmar decisión
                                            </Button>
                                        </div>
                                    )}
                                {data!.actor.admin &&
                                    current.estado ===
                                        "APROBADA_PENDIENTE_CUENTA" && (
                                        <>
                                            <p className={styles.muted}>
                                                La aprobación está registrada.
                                                La creación de cuenta verificará
                                                los datos del empleado en RRHH.
                                            </p>
                                            <Button
                                                onClick={() => void provision()}
                                                state={
                                                    busy ? "loading" : "default"
                                                }
                                            >
                                                Crear cuenta aprobada
                                            </Button>
                                        </>
                                    )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </dialog>
    );
}
