"use client";
import Link from "next/link";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";
import { Button } from "@/components/client/atoms/Button";
import { InventoryCatalog } from "@/components/client/organisms/ResourceWorkspace/InventoryPicker";
import { useAuthStore } from "@/store/useAuthStore";
import {
    platformCommand,
    platformFetch,
    PlatformError,
} from "@/platform/client";
import {
    HR_STATES,
    hrDate,
    hrDraft,
    type HrAnswer,
    type HrMine,
    type HrProfile,
    type HrReview,
} from "@/platform/hr";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./HrWorkspace.module.scss";
export const hrError = (e: unknown) =>
    (e instanceof Error ? e.message : "No se pudo completar la operación.") +
    (e instanceof PlatformError && e.reference
        ? " Referencia: " + e.reference
        : "");
export function HrSubmission({
    data,
}: {
    data: Pick<HrReview, "campana" | "entrega" | "estado">;
}) {
    const delivery = data.entrega;
    if (!delivery) return <p>No se ha enviado una actualización.</p>;
    return (
        <div>
            <p>
                <strong>{HR_STATES[data.estado]}</strong> · Envío{" "}
                {delivery.revision} · {hrDate(delivery.enviadoEn)}
            </p>
            <p>
                {delivery.aplicadoEn
                    ? "Datos editables aplicados: " +
                      hrDate(delivery.aplicadoEn)
                    : data.estado === "ANTERIOR"
                      ? "Esta versión no aplicó cambios al registro oficial."
                      : "Los cambios editables están pendientes de aplicación."}
            </p>
            <div className={styles.tableRegion}>
                <table className={styles.table}>
                    <caption>Datos enviados para esta campaña</caption>
                    <thead>
                        <tr>
                            <th>Campo</th>
                            <th>Registrado al enviar</th>
                            <th>Respuesta</th>
                            <th>Observación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.campana.campos.map((f) => {
                            const a = delivery.respuestas[f.codigo];
                            return (
                                <tr key={f.codigo}>
                                    <th scope="row">
                                        {f.codigo.replace(/_/g, " ")}
                                    </th>
                                    <td>
                                        {delivery.original[f.codigo] ??
                                            "No registrado"}
                                    </td>
                                    <td>
                                        {f.modo === "CONFIRMAR"
                                            ? a?.confirmacion === "CORREGIR"
                                                ? "Solicita corrección"
                                                : "Confirma correcto"
                                            : (a?.valor ?? "Sin dato")}
                                    </td>
                                    <td>{a?.observacion || "—"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {delivery.observacion && (
                <p>
                    <strong>Observación general: </strong>
                    {delivery.observacion}
                </p>
            )}
            {delivery.revisiones.map((r, i) => (
                <div className={local.reviewNote} key={i}>
                    <strong>
                        {r.actor} · {hrDate(r.fecha)}
                    </strong>
                    <p>{r.observacion}</p>
                </div>
            ))}
        </div>
    );
}
function HrUpdateForm({ id, onSent }: { id: string; onSent: () => void }) {
    const [data, setData] = useState<HrMine | null>(null),
        [answers, setAnswers] = useState<Record<string, HrAnswer>>({}),
        [note, setNote] = useState(""),
        [error, setError] = useState(""),
        [message, setMessage] = useState(""),
        [busy, setBusy] = useState(false);
    const active = useRef(true),
        flight = useRef(false),
        request = useRef<AbortController | null>(null);
    const load = useCallback(async () => {
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setError("");
        try {
            const r = await platformFetch<HrMine>(
                "/hr/me/campaigns/" + encodeURIComponent(id),
                {
                    signal: AbortSignal.any([
                        controller.signal,
                        AbortSignal.timeout(45000),
                    ]),
                },
            );
            if (controller.signal.aborted) return;
            setData(r);
            setAnswers((prior) => hrDraft(r, prior));
        } catch (e) {
            if (!controller.signal.aborted) setError(hrError(e));
        }
    }, [id]);
    useEffect(() => {
        active.current = true;
        void load();
        return () => {
            active.current = false;
            request.current?.abort();
        };
    }, [load]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!data || flight.current) return;
        flight.current = true;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await platformCommand(
                "/hr/me/campaigns/" + id + "/submit",
                "POST",
                {
                    version: data.version,
                    huella: data.perfil.huella,
                    respuestas: answers,
                    observacion: note,
                },
                false,
                "Enviar mi actualización de datos",
            );
            if (!active.current) return;
            setMessage(
                data.campana.modo === "AL_ENVIAR"
                    ? "Actualización registrada. Los campos editables se aplicaron; las solicitudes de corrección se enviaron a RRHH."
                    : "Actualización enviada. RRHH revisará los cambios antes de aplicarlos.",
            );
            onSent();
            window.dispatchEvent(new Event("tickets-hr-updated"));
            await load();
        } catch (e) {
            if (active.current) setError(hrError(e));
        } finally {
            flight.current = false;
            if (active.current) setBusy(false);
        }
    }
    const open = Boolean(
            data?.campana.ventana === "ABIERTA" &&
                Date.parse(data.campana.fin) > Date.now(),
        ),
        editable =
            open &&
            Boolean(data?.perfil.vinculado) &&
            ["PENDIENTE", "DEVUELTA"].includes(data?.estado || "");
    function answer(code: string, value: HrAnswer) {
        setAnswers((prior) => ({
            ...prior,
            [code]: { ...prior[code], ...value },
        }));
    }
    return (
        <section className={styles.card} aria-label="Actualizar mis datos">
            <div className={styles.toolbar}>
                <h2>{data?.campana.nombre || "Actualización de datos"}</h2>
                <Link href="/mi-perfil">Volver a mis datos</Link>
            </div>
            {error && (
                <div role="alert" className={styles.error}>
                    {error}
                    <p>
                        Conservamos lo que has escrito. Al recargar los datos
                        tendrás que confirmar otra vez los campos de solo
                        confirmación.
                    </p>
                    <Button
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => void load()}
                    >
                        Recargar datos oficiales
                    </Button>
                </div>
            )}
            {message && (
                <p role="status" className={local.success}>
                    {message}
                </p>
            )}
            {!data && !error && <p role="status">Cargando la campaña…</p>}
            {data && (
                <>
                    <p>{data.campana.descripcion}</p>
                    <p>
                        <strong>
                            {data.campana.ventana === "CERRADA"
                                ? "Campaña cerrada"
                                : data.campana.ventana === "PROGRAMADA"
                                  ? "Aún no inicia"
                                  : "Actualización obligatoria"}
                        </strong>{" "}
                        · Del {hrDate(data.campana.inicio)} al{" "}
                        {hrDate(data.campana.fin)}
                    </p>
                    <p>
                        {data.campana.modo === "AL_ENVIAR"
                            ? "Los campos editables se aplicarán al registro oficial cuando envíes."
                            : "Los cambios quedarán pendientes de aprobación de RRHH."}{" "}
                        Los datos de solo confirmación no se modifican desde
                        este formulario.
                    </p>
                    {!data.perfil.vinculado && (
                        <p role="alert" className={styles.error}>
                            {data.perfil.mensaje}
                        </p>
                    )}
                    {data.estado === "DEVUELTA" &&
                        data.entrega?.revisiones.at(-1) && (
                            <p className={styles.error}>
                                RRHH solicita correcciones:{" "}
                                {data.entrega.revisiones.at(-1)?.observacion}
                            </p>
                        )}
                    {editable ? (
                        <form onSubmit={submit}>
                            <fieldset
                                disabled={busy}
                                className={local.fieldset}
                            >
                                <legend>
                                    Revisa los campos solicitados por RRHH
                                </legend>
                                {data.campana.campos.map((selection) => {
                                    const field = data.perfil.campos.find(
                                        (f) => f.codigo === selection.codigo,
                                    );
                                    if (!field)
                                        return (
                                            <p
                                                role="alert"
                                                key={selection.codigo}
                                            >
                                                El campo {selection.codigo} no
                                                está disponible. Contacta con
                                                RRHH.
                                            </p>
                                        );
                                    const value = answers[field.codigo] || {};
                                    return (
                                        <div
                                            className={local.question}
                                            key={field.codigo}
                                        >
                                            <label
                                                htmlFor={"hr-" + field.codigo}
                                            >
                                                <strong>
                                                    {field.etiqueta}
                                                </strong>
                                                {selection.obligatorio
                                                    ? " *"
                                                    : ""}
                                            </label>
                                            <p className={styles.muted}>
                                                En RRHH:{" "}
                                                {data.perfil.datos[
                                                    field.codigo
                                                ] ?? "No registrado"}
                                            </p>
                                            {selection.modo === "EDITAR" ? (
                                                <input
                                                    id={"hr-" + field.codigo}
                                                    className={styles.control}
                                                    type={
                                                        field.tipo === "fecha"
                                                            ? "date"
                                                            : /CORREO/.test(
                                                                    field.codigo,
                                                                )
                                                              ? "email"
                                                              : "text"
                                                    }
                                                    inputMode={
                                                        field.tipo === "numero"
                                                            ? "decimal"
                                                            : undefined
                                                    }
                                                    maxLength={Math.min(
                                                        field.maximo,
                                                        2000,
                                                    )}
                                                    value={value.valor ?? ""}
                                                    required={
                                                        selection.obligatorio ||
                                                        !field.permiteNulo
                                                    }
                                                    onChange={(e) =>
                                                        answer(field.codigo, {
                                                            valor: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <>
                                                    <select
                                                        id={
                                                            "hr-" + field.codigo
                                                        }
                                                        className={
                                                            styles.control
                                                        }
                                                        required
                                                        value={
                                                            value.confirmacion ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            answer(
                                                                field.codigo,
                                                                {
                                                                    confirmacion:
                                                                        e.target
                                                                            .value as HrAnswer["confirmacion"],
                                                                    observacion:
                                                                        e.target
                                                                            .value === "CORRECTO"
                                                                            ? ""
                                                                            : value.observacion,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Selecciona una
                                                            respuesta
                                                        </option>
                                                        <option value="CORRECTO">
                                                            Confirmo que es
                                                            correcto
                                                        </option>
                                                        <option value="CORREGIR">
                                                            Necesito solicitar
                                                            una corrección
                                                        </option>
                                                    </select>
                                                    {value.confirmacion ===
                                                        "CORREGIR" && (
                                                        <div
                                                            className={
                                                                styles.field
                                                            }
                                                        >
                                                            <label
                                                                htmlFor={
                                                                    "hr-observacion-" +
                                                                    field.codigo
                                                                }
                                                            >
                                                                ¿Qué debe
                                                                revisar RRHH? *
                                                            </label>
                                                            <textarea
                                                                id={
                                                                    "hr-observacion-" +
                                                                    field.codigo
                                                                }
                                                                className={
                                                                    styles.control
                                                                }
                                                                required
                                                                maxLength={2000}
                                                                value={
                                                                    value.observacion ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    answer(
                                                                        field.codigo,
                                                                        {
                                                                            observacion:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            <span
                                                                className={
                                                                    styles.muted
                                                                }
                                                            >
                                                                RRHH revisará la
                                                                observación y se
                                                                pondrá en
                                                                contacto
                                                                contigo.
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                                <div className={styles.field}>
                                    <label htmlFor="hr-note">
                                        Observación general (opcional)
                                    </label>
                                    <textarea
                                        className={styles.control}
                                        id="hr-note"
                                        value={note}
                                        maxLength={2000}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
                                    />
                                </div>
                                <p className={styles.muted}>
                                    Revisa todos los datos antes de enviar.
                                    Podrás volver a completarlos si RRHH
                                    solicita correcciones dentro del plazo.
                                </p>
                                <Button
                                    type="submit"
                                    state={busy ? "loading" : "default"}
                                >
                                    Enviar actualización
                                </Button>
                            </fieldset>
                        </form>
                    ) : data.entrega ? (
                        <HrSubmission data={data} />
                    ) : (
                        <p>
                            No puedes enviar datos fuera del periodo de
                            actualización.
                        </p>
                    )}
                </>
            )}
        </section>
    );
}
export function HrProfileWorkspace({ campaignId }: { campaignId?: string }) {
    const [profile, setProfile] = useState<HrProfile | null>(null),
        [error, setError] = useState(""),
        [filter, setFilter] = useState(""),
        [view, setView] = useState("datos");
    const token = useAuthStore((s) => s.token),
        userId = useAuthStore((s) => s.getUserId()),
        generation = useRef(0);
    const load = useCallback(async () => {
        const version = ++generation.current;
        setError("");
        try {
            const p = await platformFetch<HrProfile>("/hr/me");
            if (version === generation.current) setProfile(p);
        } catch (e) {
            if (version === generation.current) setError(hrError(e));
        }
    }, []);
    useEffect(() => {
        setProfile(null);
        if (token) void load();
        return () => {
            generation.current++;
        };
    }, [token, load]);
    const groups = profile
        ? [...new Set(profile.campos.map((f) => f.grupo))]
        : [];
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <div>
                    <h1>Mi perfil</h1>
                    <p className={styles.muted}>
                        Tus datos registrados en Recursos Humanos y tus campañas
                        de actualización.
                    </p>
                </div>
                <Button onClick={() => void load()} variant="outlined">
                    Actualizar perfil
                </Button>
            </div>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {campaignId ? (
                <HrUpdateForm
                    key={campaignId + String(userId)}
                    id={campaignId}
                    onSent={() => void load()}
                />
            ) : (
                <>
                    {!profile && !error && (
                        <p role="status">Cargando tus datos…</p>
                    )}
                    {profile && (
                        <>
                            <section
                                className={styles.card}
                                aria-label="Campañas para mí"
                            >
                                <h2>Actualización de datos</h2>
                                {!profile.campanas.length && (
                                    <p>
                                        No tienes campañas asignadas en este
                                        momento.
                                    </p>
                                )}
                                {profile.campanas.map((c) => (
                                    <article
                                        key={c.id}
                                        className={local.campaign}
                                    >
                                        <div>
                                            <h3>{c.nombre}</h3>
                                            <p>
                                                <strong>
                                                    {c.ventana === "CERRADA"
                                                        ? "Campaña cerrada · " +
                                                          HR_STATES[c.estado]
                                                        : c.ventana ===
                                                            "PROGRAMADA"
                                                          ? "Programada"
                                                          : c.pendiente
                                                            ? "Obligatoria · Pendiente"
                                                            : HR_STATES[
                                                                  c.estado
                                                              ]}
                                                </strong>{" "}
                                                ·{" "}
                                                {c.ventana === "PROGRAMADA"
                                                    ? "Apertura: " +
                                                      hrDate(c.inicio)
                                                    : "Cierre: " +
                                                      hrDate(c.fin)}
                                            </p>
                                        </div>
                                        <Link
                                            href={
                                                "/mi-perfil?campana=" +
                                                encodeURIComponent(c.id)
                                            }
                                        >
                                            {c.pendiente
                                                ? "Completar actualización"
                                                : "Ver actualización"}
                                        </Link>
                                    </article>
                                ))}
                            </section>
                            <div className={styles.tabs}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setView("datos")}
                                >
                                    Datos de RRHH
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setView("bienes")}
                                >
                                    Bienes asignados
                                </Button>
                            </div>
                            {view === "bienes" ? (
                                <InventoryCatalog
                                    usuarioId={String(userId)}
                                    title="Mis bienes asignados"
                                />
                            ) : profile.vinculado ? (
                                <>
                                    <section className={styles.card}>
                                        <h2>
                                            {[
                                                profile.datos.PRIMER_NOMBRE,
                                                profile.datos.SEGUNDO_NOMBRE,
                                                profile.datos.PRIMER_APELLIDO,
                                                profile.datos.SEGUNDO_APELLIDO,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                                "Mi ficha de RRHH"}
                                        </h2>
                                        <p>
                                            Empresa {profile.empresa} · Código
                                            de empleado {profile.empleado}
                                        </p>
                                        <p className={styles.muted}>
                                            Esta es tu ficha oficial de RRHH.
                                            Las campañas indican qué campos
                                            actualizar o confirmar; los códigos
                                            laborales se muestran tal como están
                                            registrados.
                                        </p>
                                        <div className={styles.field}>
                                            <label htmlFor="hr-search">
                                                Buscar un dato de mi ficha
                                            </label>
                                            <input
                                                id="hr-search"
                                                className={styles.control}
                                                value={filter}
                                                onChange={(e) =>
                                                    setFilter(e.target.value)
                                                }
                                            />
                                        </div>
                                    </section>
                                    {groups.map((group) => {
                                        const fields = profile.campos.filter(
                                            (f) =>
                                                f.grupo === group &&
                                                (f.etiqueta + " " + f.codigo)
                                                    .toLowerCase()
                                                    .includes(
                                                        filter.toLowerCase(),
                                                    ),
                                        );
                                        return fields.length ? (
                                            <section
                                                key={group}
                                                className={styles.card}
                                            >
                                                <h2>{group}</h2>
                                                <dl
                                                    className={
                                                        local.profileGrid
                                                    }
                                                >
                                                    {fields.map((f) => (
                                                        <div key={f.codigo}>
                                                            <dt>
                                                                {f.etiqueta}
                                                            </dt>
                                                            <dd>
                                                                {profile.datos[
                                                                    f.codigo
                                                                ] ??
                                                                    "No registrado"}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            </section>
                                        ) : null;
                                    })}
                                </>
                            ) : (
                                <section className={styles.card}>
                                    <h2>Vínculo con RRHH pendiente</h2>
                                    <p>{profile.mensaje}</p>
                                </section>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
