"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { MeetingPlaceField } from "./MeetingFields";
import { resourceDefinition } from "@/platform/resources";
import { usePlatform } from "@/platform/context";
import { InventoryPicker, inventoryClass } from "./InventoryPicker";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
import sheet from "./RecordSheet.module.scss";
import { statusLabel } from "@/helpers/statusTone";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import { PLATFORM_SECTIONS } from "@/platform/navigation";
import { useProposalDesign } from "@/platform/proposal";
export function RecordEditor({
    type,
    record,
    initial,
    initialName,
    initialTeamId,
    onClose,
    onSaved,
}: {
    type: string;
    record?: PlatformRecord;
    initial?: Record<string, unknown>;
    initialName?: string;
    initialTeamId?: string;
    onClose: () => void;
    onSaved: (record: PlatformRecord) => void;
}) {
    const proposal = useProposalDesign();
    const { data: context } = usePlatform(),
        def = resourceDefinition(type, context!.definitions[type]),
        availableTeams = context!.teams.filter(
            (t) =>
                context!.actor.admin ||
                !["calendario", "accesos"].includes(def.group) ||
                context!.memberships.some(
                    (m) => m.equipoId === t.id && m.funcion === "JEFATURA",
                ),
        ),
        dialog = useRef<HTMLDialogElement>(null),
        busyRef = useRef(false);
    const [searchInventory, setSearchInventory] = useState(false);
    const [nombre, setNombre] = useState(record?.nombre || initialName || ""),
        [equipoId, setEquipo] = useState(
            record?.equipoId || initialTeamId || availableTeams[0]?.id || "",
        ),
        [visibilidad, setVisibility] = useState(
            record?.visibilidad ||
                (type === "solicitudes" ? "PRIVADA" : "EQUIPO"),
        ),
        [estado, setEstado] = useState(
            record?.estado ||
                def.states?.[0] ||
                (type === "solicitudes" ? "PENDIENTE" : "ACTIVO"),
        ),
        [datos, setDatos] = useState<Record<string, unknown>>(
            record?.datos || {
                ...(type === "dispositivos" ? { x: 120, y: 100 } : {}),
                ...initial,
            },
        ),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    useEffect(() => {
        dialog.current?.showModal();
    }, []);
    const fields = def.fields.filter(
        (f) =>
            (f.key !== "activoId" ||
                context!.definitions.activos?.actions.LEER) &&
            !["x", "y", "planoX", "planoY", "inventarioReferencia"].includes(
                f.key,
            ),
    );
    const fromHr =
        ["equipos", "miembros"].includes(type) && !!record?.datos._rrhh;
    async function changeField(key: string, value: unknown) {
        setDatos((p) => ({ ...p, [key]: value }));
        if (type === "dispositivos" && key === "activoId" && value) {
            try {
                const asset = await platformFetch<PlatformRecord>(
                    "/records/activos/" + value,
                );
                setNombre(asset.nombre);
                setDatos((p) => ({
                    ...p,
                    numeroInventario: asset.datos.numeroInventario,
                    inventarioReferencia: asset.datos.inventarioReferencia,
                    serie: asset.datos.serie,
                    modelo: asset.datos.modelo,
                }));
            } catch {
                setError(
                    "No se pudo cargar la ficha vinculada. Reintenta antes de guardar.",
                );
            }
        }
    }
    async function save(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setError("");
        try {
            const saved = await platformCommand<PlatformRecord>(
                "/records/" + type + (record ? "/" + record.id : ""),
                record ? "PATCH" : "POST",
                {
                    ...(record ? { version: record.version } : {}),
                    data: {
                        nombre,
                        equipoId: ["equipos", "modulos"].includes(type)
                            ? null
                            : equipoId,
                        visibilidad,
                        estado,
                        datos,
                    },
                },
                context!.actor.admin,
                (record ? "Actualizar " : "Registrar ") + def.singular,
            );
            onSaved(saved);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo guardar. Conserva los datos e intenta nuevamente.",
            );
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    }
    const sectionIcon =
        PLATFORM_SECTIONS.find((s) => s.id === def.group)?.iconName || "table-cells-large-solid";
    return (
        <dialog
            ref={dialog}
            className={proposal ? `${styles.dialog} ${sheet.sheet}` : styles.dialog}
            aria-labelledby="record-editor-title"
            onCancel={(e) => {
                e.preventDefault();
                if (!busy) onClose();
            }}
        >
            {proposal ? (
                <header className={sheet.head}>
                    <span className={sheet.icon} aria-hidden="true">
                        <WorkspaceIcon name={sectionIcon} size={20} />
                    </span>
                    <div className={sheet.titles}>
                        <p className={sheet.kind}>{record ? "Editar" : "Nuevo registro"}</p>
                        <h2 id="record-editor-title">
                            {record ? record.nombre : "Registrar " + def.singular.toLowerCase()}
                        </h2>
                        <p className={sheet.sub}>
                            {def.singular} · Los campos con * son obligatorios.
                        </p>
                    </div>
                    <button type="button" className={sheet.close} onClick={onClose} disabled={busy} aria-label="Cerrar formulario">
                        ×
                    </button>
                </header>
            ) : (
            <div className={styles.dialogHeader}>
                <h2 id="record-editor-title">
                    {record ? "Editar" : "Registrar"}{" "}
                    {def.singular.toLowerCase()}
                </h2>
                <Button
                    type="button"
                    variant="outlined"
                    onClick={onClose}
                    state={busy ? "disabled" : "default"}
                >
                    Cerrar
                </Button>
            </div>
            )}
            {!record && !datos.inventarioReferencia && def.actions.LEER && ["activos", "dispositivos"].includes(type) && (
                <section className={styles.card} style={proposal ? { margin: "14px 22px 0" } : undefined}>
                {!searchInventory ? <Button type="button" variant="outlined" onClick={()=>setSearchInventory(true)}>Buscar un bien en Activos Fijos</Button> : <InventoryPicker
                    type={type}
                    onSelect={(item) => {
                        setNombre(
                            item.descripcion.slice(0, 200) ||
                                "Bien " + item.numeroInventario,
                        );
                        const clase = inventoryClass(
                            item.descripcion,
                            type === "dispositivos",
                        );
                        setDatos((p) => ({
                            ...p,
                            inventarioReferencia: item.referencia,
                            numeroInventario: item.numeroInventario,
                            serie: item.serie,
                            modelo: item.modelo,
                            ...(clase ? { clase } : {}),
                            ...(type === "activos"
                                ? { detalle: item.descripcion }
                                : {}),
                        }));
                    }}
                />}
                </section>
            )}
            {typeof datos.inventarioReferencia === "string" && (
                <p role="status" className={proposal ? sheet.callout : styles.card} style={proposal ? { margin: "14px 22px 0" } : undefined}>
                    Vinculado al bien institucional{" "}
                    {String(datos.numeroInventario)}. Revisa el tipo sugerido,
                    la instalación y el responsable técnico; en red confirma
                    también los puertos reales.
                </p>
            )}
            <form onSubmit={save} className={proposal ? sheet.form : styles.dialogBody}>
                <div className={proposal ? undefined : styles.split}>
                    <section className={proposal ? undefined : styles.card}>
                        <div className={proposal ? sheet.formBody : styles.formGrid}>
                            <label className={styles.field}>
                                Nombre *
                                <input
                                    className={styles.control}
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    maxLength={200}
                                    required
                                    disabled={busy}
                                />
                            </label>
                            {!["equipos", "modulos"].includes(type) && (
                                <label className={styles.field}>
                                    Equipo de trabajo *
                                    <select
                                        className={styles.control}
                                        aria-label="Equipo de trabajo"
                                        value={equipoId}
                                        onChange={(e) =>
                                            setEquipo(e.target.value)
                                        }
                                        required
                                        disabled={busy || fromHr}
                                    >
                                        <option value="">Seleccionar…</option>
                                        {availableTeams.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            {fields.map((field) => type === "actividades" && proposal && field.key === "lugar" ? (
                                <MeetingPlaceField
                                    key={field.key}
                                    value={datos.lugar}
                                    disabled={busy}
                                    onChange={(value) => void changeField("lugar", value)}
                                />
                            ) : (
                                <PlatformField
                                    key={field.key}
                                    field={field}
                                    value={datos[field.key]}
                                    disabled={
                                        busy ||
                                        (field.key === "numeroInventario" &&
                                            !!datos.inventarioReferencia) ||
                                        (fromHr && field.key === "unidadRh") ||
                                        (type === "miembros" &&
                                            Boolean(record) &&
                                            field.key === "usuarioId")
                                    }
                                    onChange={(value) =>
                                        void changeField(field.key, value)
                                    }
                                />
                            ))}
                            {type === "actividades" && (
                                <label className={styles.field}>
                                    {proposal ? "¿Quién puede verla?" : "Visibilidad"}
                                    <select
                                        className={styles.control}
                                        value={visibilidad}
                                        onChange={(e) =>
                                            setVisibility(e.target.value)
                                        }
                                        disabled={busy}
                                    >
                                        <option value="EQUIPO">
                                            {proposal ? "Mi equipo · la ve todo el equipo" : "Mi equipo"}
                                        </option>
                                        <option value="PRIVADA">{proposal ? "Personal · solo la veo yo" : "Privada"}</option>
                                        {context!.actor.admin && (
                                            <option value="EMPRESA">
                                                {proposal ? "Toda la empresa" : "General de la empresa"}
                                            </option>
                                        )}
                                    </select>
                                </label>
                            )}
                            {record &&
                                ![
                                    "solicitudes",
                                    "movimientos-activos",
                                ].includes(type) && (
                                    <label className={styles.field}>
                                        Estado
                                        <select
                                            className={styles.control}
                                            value={estado}
                                            onChange={(e) =>
                                                setEstado(e.target.value)
                                            }
                                            disabled={busy}
                                        >
                                            {[
                                                ...new Set([
                                                    ...(def.states || [
                                                        "ACTIVO",
                                                        "INACTIVO",
                                                    ]),
                                                    estado,
                                                ]),
                                            ].map((s) => (
                                                <option key={s} value={s}>
                                                    {proposal ? statusLabel(s) : s}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                        </div>
                    </section>
                    <aside className={styles.card} hidden={proposal}>
                        <h3>Resumen</h3>
                        {fromHr && (
                            <p className={styles.muted}>
                                La unidad se actualiza desde RRHH. Puedes
                                revisar las responsabilidades y los ajustes del
                                equipo sin perder su origen institucional.
                            </p>
                        )}
                        {["activos", "dispositivos"].includes(type) &&
                            !datos.inventarioReferencia && (
                                <p className={styles.error}>
                                    Número ingresado manualmente. Selecciona el
                                    bien de su tarjeta para vincularlo al
                                    inventario institucional.
                                </p>
                            )}
                        <p>{nombre || def.singular}</p>
                        <p className={styles.muted}>
                            {context!.teams.find((t) => t.id === equipoId)
                                ?.nombre || "Administración institucional"}
                        </p>
                        <p className={styles.muted}>
                            El cambio se registrará a nombre de{" "}
                            {context!.actor.nombre}. El historial conservará la
                            fecha y el resultado de la operación.
                        </p>
                        {context!.actor.admin && (
                            <p className={styles.muted}>
                                Antes de aplicar el cambio revisarás dos
                                confirmaciones.
                            </p>
                        )}
                    </aside>
                </div>
                {error && (
                    <p role="alert" className={styles.error} style={proposal ? { margin: "0 22px 14px" } : undefined}>
                        {error}
                    </p>
                )}
                {proposal && fromHr && (
                    <p className={sheet.callout} style={{ margin: "0 22px 14px" }}>
                        La unidad se actualiza desde RRHH; puedes ajustar responsabilidades sin perder su origen.
                    </p>
                )}
                {proposal ? (
                    <footer className={sheet.foot}>
                        <p>
                            Se registrará a nombre de {context!.actor.nombre}
                            {context!.actor.admin ? "; antes de aplicarlo revisarás dos confirmaciones." : "."}
                        </p>
                        <div className={sheet.footActions}>
                            <Button type="button" variant="outlined" onClick={onClose} state={busy ? "disabled" : "default"}>
                                Cancelar
                            </Button>
                            <Button type="submit" state={busy ? "loading" : "default"}>
                                {record ? "Guardar cambios" : "Registrar"}
                            </Button>
                        </div>
                    </footer>
                ) : (
                <div className={styles.actions}>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onClose}
                        state={busy ? "disabled" : "default"}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" state={busy ? "loading" : "default"}>
                        Guardar
                    </Button>
                </div>
                )}
            </form>
        </dialog>
    );
}
