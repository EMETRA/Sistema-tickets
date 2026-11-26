"use client";
import { useQueryClient } from "@tanstack/react-query";
import { platformKey, queryErrorMessage, usePlatformQuery } from "@/platform/query";
import { displayDate } from "@/helpers/displayDate";
import { statusLabel, statusTone } from "@/helpers/statusTone";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { resourceDefinition } from "@/platform/resources";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import Link from "next/link";
import { RecordFiles } from "./RecordFiles";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import sheet from "./RecordSheet.module.scss";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import { PLATFORM_SECTIONS } from "@/platform/navigation";
import { MeetingCard, ParticipantChips } from "@/features/calendario/components/MeetingFields/MeetingCard";
import { meetingLink, meetingPlace } from "@/platform/meeting";
function display(value: unknown) {
    if (value === null || value === undefined || value === "") return "No disponible";
    if (typeof value === "boolean") return value ? "Sí" : "No";
    return Array.isArray(value) ? value.join(", ") : String(value).replaceAll("_", " ");
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
type DetailRecord = PlatformRecord & {
    labels?: Record<string, string>;
    invitacion?: {
        estado: string;
        intentadoEn: string | null;
        enviadoEn: string | null;
    };
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
        def = resourceDefinition(type, data!.definitions[type]),
        dialog = useRef<HTMLDialogElement>(null),
        [tab, setTab] = useState("info"),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [decision, setDecision] = useState("APROBAR"),
        [observacion, setObservacion] = useState("");
    const queryClient = useQueryClient();
    const detailPath = "/records/" + type + "/" + record.id;
    // Ficha completa (con etiquetas e invitación); mientras llega se muestra la fila de la lista.
    const detail = usePlatformQuery<DetailRecord>(detailPath, { placeholderData: record });
    const current: DetailRecord = detail.data ?? record;
    const setCurrent = (next: DetailRecord) => queryClient.setQueryData(platformKey(detailPath), next);
    const historyQuery = usePlatformQuery<Change[]>(tab === "history" ? detailPath + "/history" : null);
    const history = historyQuery.data ?? [];
    const loadError = queryErrorMessage(detail.error || historyQuery.error);
    const readOnly = type === "actividades" && current.visibilidad === "EMPRESA" && !data!.actor.admin;
    const employment = current.datos._rrhh as { unidad?: string; puesto?: string } | undefined;
    const automatic = current.datos._automatico as
        { cantidad?: number; primeraVez?: string; ultimaVez?: string } | undefined;
    useEffect(() => {
        dialog.current?.showModal();
    }, []);
    const previewQuery = usePlatformQuery<RequestPreview>(
        type === "solicitudes" && data!.actor.admin && current.estado === "PENDIENTE"
            ? "/requests/" + current.id + "/preview"
            : null,
    );
    const preview = previewQuery.data ?? null;
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
            setError(e instanceof Error ? e.message : "No se pudo retirar el registro.");
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
            setError(e instanceof Error ? e.message : "No se pudo resolver la solicitud.");
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
            setCurrent(await platformFetch<PlatformRecord>("/records/" + type + "/" + current.id));
            onChanged();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo crear la cuenta; la aprobación se conserva.",
            );
        } finally {
            setBusy(false);
        }
    }
    // Propuesta: valor legible por tipo de campo; vacío se muestra como «—».
    const sectionIcon =
        PLATFORM_SECTIONS.find((s) => s.id === def.group)?.iconName || "table-cells-large-solid";
    const teamName =
        data!.teams.find((t) => t.id === current.equipoId)?.nombre || "Administración institucional";
    const factValue = (field: { key: string; type: string }) => {
        const label = current.labels?.[field.key];
        const raw = current.datos[field.key];
        if (label) return label;
        if (raw === null || raw === undefined || raw === "") return null;
        if (type === "actividades" && field.key === "lugar" && meetingLink(raw))
            return meetingPlace(raw) ? `${meetingPlace(raw)} y en línea` : "En línea (ver enlace arriba)";
        if (type === "actividades" && field.key === "participantes" && Array.isArray(raw))
            return raw.length ? <ParticipantChips ids={raw.map(Number)} /> : null;
        if (["date", "datetime"].includes(field.type)) return displayDate(raw);
        if (field.type === "select") return statusLabel(String(raw));
        if (field.type === "url")
            return (
                <a href={String(raw)} target="_blank" rel="noreferrer">
                    {String(raw)} ↗
                </a>
            );
        return display(raw);
    };
    return (
        <dialog
            ref={dialog}
            className={`${styles.dialog} ${sheet.sheet}`}
            aria-labelledby="record-detail-title"
            onCancel={(e) => {
                e.preventDefault();
                if (!busy) onClose();
            }}
        >
            {
                <header className={sheet.head}>
                    <span className={sheet.icon} aria-hidden="true">
                        <WorkspaceIcon name={sectionIcon} size={20} />
                    </span>
                    <div className={sheet.titles}>
                        <p className={sheet.kind}>
                            {def.singular}
                            <span className={styles.chip} data-tone={statusTone(current.estado)}>
                                {statusLabel(current.estado)}
                            </span>
                        </p>
                        <h2 id="record-detail-title">{current.nombre}</h2>
                        <p className={sheet.sub}>
                            {teamName} · Actualizado {displayDate(current.actualizadoEn)}
                        </p>
                    </div>
                    <button
                        type="button"
                        className={sheet.close}
                        onClick={onClose}
                        disabled={busy}
                        aria-label="Cerrar ficha"
                    >
                        ×
                    </button>
                </header>
            }
            <div className={sheet.body}>
                <div className={styles.toolbar} hidden>
                    <span className={styles.chip} data-tone={statusTone(current.estado)}>
                        {statusLabel(current.estado)}
                    </span>
                    <div className={styles.actions}>
                        {!readOnly && def.actions.EDITAR && (
                            <Button variant="outlined" onClick={() => onEdit(current)}>
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
                {["equipos", "miembros"].includes(type) && data?.definitions.activos?.actions.LEER && (
                    <Link
                        className={styles.link}
                        href={
                            "/espacio/inventario?view=inventario&" +
                            (type === "equipos" ? "equipoId=" + current.id : "usuarioId=" + current.usuarioId)
                        }
                    >
                        Ver bienes asignados en el inventario
                    </Link>
                )}
                {readOnly && (
                    <p className={styles.muted}>Este registro está disponible solo para consulta.</p>
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
                {(error || loadError || previewQuery.error) && (
                    <p role="alert" className={styles.error}>
                        {error || loadError || queryErrorMessage(previewQuery.error)}
                    </p>
                )}
                {tab === "files" ? (
                    <RecordFiles type={type} record={current} readOnly={readOnly} />
                ) : tab === "history" ? (
                    <section className={styles.card}>
                        <h3>Historial de cambios</h3>
                        <ul className={styles.timeline}>
                            {history.map((item) => (
                                <li key={item.id}>
                                    <strong>
                                        {item.accion.replaceAll("_", " ")} · {item.resultado}
                                    </strong>
                                    <p className={styles.muted}>
                                        {item.actor} · {displayDate(item.fecha)}
                                    </p>
                                    <details>
                                        <summary>Ver cambios registrados</summary>
                                        <div className={styles.grid}>
                                            {[
                                                ["Antes", item.antes],
                                                ["Después", item.despues],
                                            ].map(([name, value]) => (
                                                <div key={String(name)}>
                                                    <h4>{String(name)}</h4>
                                                    <pre className={styles.log}>
                                                        {JSON.stringify(value, null, 2)}
                                                    </pre>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </li>
                            ))}
                        </ul>
                        {!history.length && (
                            <p className={styles.muted}>No hay movimientos adicionales registrados.</p>
                        )}
                    </section>
                ) : (
                    <>
                        <section>
                            {type === "incidencias" && automatic && (
                                <div>
                                    <h3>Detectada automáticamente</h3>
                                    <p>
                                        Ocurrencias: {automatic.cantidad} · Primera detección:{" "}
                                        {displayDate(automatic.primeraVez)} · Última detección:{" "}
                                        {displayDate(automatic.ultimaVez)}
                                    </p>
                                </div>
                            )}
                            {employment && (
                                <div className={styles.card}>
                                    <h3>Datos de RRHH</h3>
                                    <p className={styles.muted}>
                                        Unidad institucional:{" "}
                                        {type === "equipos"
                                            ? current.nombre
                                            : data!.teams.find((t) => t.id === current.equipoId)?.nombre ||
                                              "Consulta la ficha del equipo"}
                                        . El puesto se actualiza al generar equipos desde RRHH.
                                    </p>
                                    {employment.puesto && (
                                        <p>
                                            <strong>Puesto: </strong>
                                            {employment.puesto}
                                        </p>
                                    )}
                                </div>
                            )}
                            {["activos", "dispositivos"].includes(type) && !!current.datos._inventario && (
                                <section className={styles.card}>
                                    <h3>Asignación institucional</h3>
                                    <p>
                                        Tarjeta:{" "}
                                        {String(
                                            (current.datos._inventario as { tarjeta?: string }).tarjeta || "",
                                        )}
                                    </p>
                                    <p>
                                        Empleado:{" "}
                                        {String(
                                            (current.datos._inventario as { nombreEmpleado?: string })
                                                .nombreEmpleado || "",
                                        )}{" "}
                                        ·{" "}
                                        {String(
                                            (current.datos._inventario as { empleado?: number }).empleado ||
                                                "",
                                        )}
                                    </p>
                                    <p className={styles.muted}>
                                        La tarjeta se consulta en el inventario institucional. El responsable
                                        técnico de esta ficha se gestiona por separado.
                                    </p>
                                </section>
                            )}
                            {["activos", "dispositivos"].includes(type) &&
                                !current.datos.inventarioReferencia && (
                                    <p className={sheet.callout} data-tone="warning">
                                        Este registro aún no está vinculado a una tarjeta de responsabilidad
                                        institucional.
                                    </p>
                                )}
                            {type === "actividades" && <MeetingCard activity={current} />}
                            {
                                <dl className={sheet.facts}>
                                    {def.fields
                                        .filter((f) => !["x", "y", "planoX", "planoY"].includes(f.key))
                                        .map((field) => {
                                            const value = factValue(field);
                                            return (
                                                <div
                                                    key={field.key}
                                                    className={
                                                        field.type === "textarea" || field.type === "list"
                                                            ? sheet.wide
                                                            : undefined
                                                    }
                                                >
                                                    <dt>{field.label}</dt>
                                                    <dd className={value === null ? sheet.empty : undefined}>
                                                        {value ?? "—"}
                                                    </dd>
                                                </div>
                                            );
                                        })}
                                </dl>
                            }
                        </section>
                        {type === "solicitudes" && (
                            <section className={styles.card}>
                                <h3>Seguimiento de la solicitud</h3>
                                {preview && (
                                    <section>
                                        <h4>Impacto de aprobar los accesos solicitados</h4>
                                        <p className={styles.muted}>
                                            {preview.agregar.length} permisos se agregan ·{" "}
                                            {preview.retirar.length} se retiran.
                                            {preview.copiaIndependiente
                                                ? " La copia quedará independiente de cambios futuros del origen."
                                                : ""}
                                        </p>
                                        <details>
                                            <summary>Ver permisos afectados</summary>
                                            {preview.agregar.map((p) => (
                                                <p key={"a" + p.id}>Agregar: {p.nombre}</p>
                                            ))}
                                            {preview.retirar.map((p) => (
                                                <p key={"r" + p.id}>Retirar: {p.nombre}</p>
                                            ))}
                                        </details>
                                    </section>
                                )}
                                {current.invitacion && (
                                    <p className={styles.muted}>
                                        Invitación por correo: {current.invitacion.estado}.{" "}
                                        {current.invitacion.estado === "ENVIADA"
                                            ? "El servidor de correo aceptó el envío; esto no confirma lectura del destinatario."
                                            : current.invitacion.estado === "INCIERTO"
                                              ? "El resultado requiere comprobación antes de reenviar."
                                              : "La cuenta ya existe; el envío de invitación se procesa por separado."}
                                    </p>
                                )}
                                {Boolean(current.datos.observacion) && (
                                    <p>{String(current.datos.observacion)}</p>
                                )}
                                {Boolean(current.datos.usuarioCreadoId) && (
                                    <p>Cuenta creada · Usuario {String(current.datos.usuarioCreadoId)}</p>
                                )}
                                {data!.actor.admin && current.estado === "PENDIENTE" && (
                                    <div className={styles.page}>
                                        <label className={styles.field}>
                                            Decisión
                                            <select
                                                className={styles.control}
                                                value={decision}
                                                onChange={(e) => setDecision(e.target.value)}
                                            >
                                                <option value="APROBAR">
                                                    Aprobar y aplicar los accesos solicitados
                                                </option>
                                                <option value="RECHAZAR">Rechazar</option>
                                            </select>
                                        </label>
                                        <label className={styles.field}>
                                            Fundamento
                                            <textarea
                                                className={styles.control}
                                                value={observacion}
                                                onChange={(e) => setObservacion(e.target.value)}
                                                minLength={5}
                                                maxLength={2000}
                                            />
                                        </label>
                                        <Button
                                            onClick={() => void decide()}
                                            state={
                                                busy
                                                    ? "loading"
                                                    : observacion.trim().length < 5
                                                      ? "disabled"
                                                      : "default"
                                            }
                                        >
                                            Confirmar decisión
                                        </Button>
                                    </div>
                                )}
                                {data!.actor.admin && current.estado === "APROBADA_PENDIENTE_CUENTA" && (
                                    <>
                                        <p className={styles.muted}>
                                            La aprobación está registrada. La creación de cuenta verificará
                                            los datos del empleado en RRHH.
                                        </p>
                                        <Button
                                            onClick={() => void provision()}
                                            state={busy ? "loading" : "default"}
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
            {
                <footer className={sheet.foot}>
                    {!readOnly && def.actions.ELIMINAR && !current.datos._rrhh && (
                        <button
                            type="button"
                            className={sheet.danger}
                            onClick={() => void remove()}
                            disabled={busy}
                        >
                            Retirar registro
                        </button>
                    )}
                    <p>
                        {readOnly
                            ? "Disponible solo para consulta."
                            : "Los cambios quedan en el historial con fecha y responsable."}
                    </p>
                    <div className={sheet.footActions}>
                        <Button variant="outlined" onClick={onClose} state={busy ? "disabled" : "default"}>
                            Cerrar
                        </Button>
                        {!readOnly && def.actions.EDITAR && (
                            <Button onClick={() => onEdit(current)}>Editar</Button>
                        )}
                    </div>
                </footer>
            }
        </dialog>
    );
}
