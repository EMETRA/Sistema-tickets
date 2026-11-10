"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { usePlatform } from "@/platform/context";
import { InventoryPicker, inventoryClass } from "./InventoryPicker";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
export function RecordEditor({
    type,
    record,
    initial,
    onClose,
    onSaved,
}: {
    type: string;
    record?: PlatformRecord;
    initial?: Record<string, unknown>;
    onClose: () => void;
    onSaved: (record: PlatformRecord) => void;
}) {
    const { data: context } = usePlatform(),
        def = context!.definitions[type],
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
    const [nombre, setNombre] = useState(record?.nombre || ""),
        [equipoId, setEquipo] = useState(
            record?.equipoId || availableTeams[0]?.id || "",
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
    return (
        <dialog
            ref={dialog}
            className={styles.dialog}
            aria-labelledby="record-editor-title"
            onCancel={(e) => {
                e.preventDefault();
                if (!busy) onClose();
            }}
        >
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
            {!record && ["activos", "dispositivos"].includes(type) && (
                <InventoryPicker
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
                />
            )}
            {typeof datos.inventarioReferencia === "string" && (
                <p role="status" className={styles.card}>
                    Vinculado al bien institucional{" "}
                    {String(datos.numeroInventario)}. Revisa el tipo sugerido,
                    la instalación y el responsable técnico; en red confirma
                    también los puertos reales.
                </p>
            )}
            <form onSubmit={save} className={styles.dialogBody}>
                <div className={styles.split}>
                    <section className={styles.card}>
                        <div className={styles.formGrid}>
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
                            {fields.map((field) => (
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
                                    Visibilidad
                                    <select
                                        className={styles.control}
                                        value={visibilidad}
                                        onChange={(e) =>
                                            setVisibility(e.target.value)
                                        }
                                        disabled={busy}
                                    >
                                        <option value="EQUIPO">
                                            Mi equipo
                                        </option>
                                        <option value="PRIVADA">Privada</option>
                                        {context!.actor.admin && (
                                            <option value="EMPRESA">
                                                General de la empresa
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
                                                <option key={s}>{s}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                        </div>
                    </section>
                    <aside className={styles.card}>
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
                    <p role="alert" className={styles.error}>
                        {error}
                    </p>
                )}
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
            </form>
        </dialog>
    );
}
