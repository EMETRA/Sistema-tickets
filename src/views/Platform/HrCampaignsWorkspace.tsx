"use client";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { useModuleActions } from "@/components/client/organisms/ModuleAccessGate/ModuleAccessGate";
import { platformCommand, platformFetch } from "@/platform/client";
import {
    HR_STATES,
    hrDate,
    hrLocalInput,
    hrLocalIso,
    hrDeadline,
    type HrCampaign,
    type HrField,
    type HrReport,
    type HrReview,
    type HrSelection,
} from "@/platform/hr";
import { HrDeliveryHistory } from "./HrDeliveryHistory";
import { HrSubmission, hrError } from "./HrProfileWorkspace";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./HrWorkspace.module.scss";
type List = { items: HrCampaign[]; offset: number; hayMas: boolean };
export function HrCampaignsWorkspace() {
    const { data: platform } = usePlatform(),
        actions = useModuleActions(),
        admin = Boolean(platform?.actor.admin);
    const [list, setList] = useState<List | null>(null),
        [options, setOptions] = useState<HrField[]>([]),
        [page, setPage] = useState(0),
        [creating, setCreating] = useState(false),
        [selected, setSelected] = useState(""),
        [error, setError] = useState(""),
        [message, setMessage] = useState(""),
        [busy, setBusy] = useState(false);
    const [name, setName] = useState(""),
        [description, setDescription] = useState(""),
        [mode, setMode] = useState("CON_REVISION"),
        [now, setNow] = useState(true),
        [start, setStart] = useState(() => hrLocalInput(new Date())),
        [end, setEnd] = useState(() =>
            hrLocalInput(hrDeadline(new Date(), "7")),
        ),
        [fields, setFields] = useState<Record<string, HrSelection>>({}),
        [filter, setFilter] = useState("");
    const [report, setReport] = useState<HrReport | null>(null),
        [reportPage, setReportPage] = useState(0),
        [state, setState] = useState(""),
        [detail, setDetail] = useState<HrReview | null>(null),
        [decision, setDecision] = useState("APROBAR"),
        [note, setNote] = useState("");
    const mounted = useRef(true),
        generation = useRef(0),
        reportGeneration = useRef(0),
        detailGeneration = useRef(0),
        flight = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            generation.current++;
            reportGeneration.current++;
            detailGeneration.current++;
        };
    }, []);
    const load = useCallback(async () => {
        const version = ++generation.current;
        setError("");
        try {
            const [o, l] = await Promise.all([
                platformFetch<{ campos: HrField[] }>("/hr/options"),
                platformFetch<List>("/hr/campaigns?offset=" + page),
            ]);
            if (version !== generation.current || !mounted.current) return;
            setOptions(o.campos);
            setList(l);
        } catch (e) {
            if (version === generation.current && mounted.current)
                setError(hrError(e));
        }
    }, [page]);
    useEffect(() => {
        void load();
    }, [load]);
    const loadReport = useCallback(async () => {
        if (!selected) {
            setReport(null);
            return;
        }
        const version = ++reportGeneration.current;
        setError("");
        try {
            const r = await platformFetch<HrReport>(
                "/hr/campaigns/" +
                    selected +
                    "/report?offset=" +
                    reportPage +
                    (state ? "&estado=" + encodeURIComponent(state) : ""),
            );
            if (version === reportGeneration.current && mounted.current)
                setReport(r);
        } catch (e) {
            if (version === reportGeneration.current && mounted.current)
                setError(hrError(e));
        }
    }, [selected, reportPage, state]);
    useEffect(() => {
        detailGeneration.current++;
        setReport(null);
        setDetail(null);
        void loadReport();
    }, [loadReport]);
    async function inspect(userId: number) {
        const version = ++detailGeneration.current;
        setDetail(null);
        setError("");
        try {
            const d = await platformFetch<HrReview>(
                "/hr/campaigns/" + selected + "/users/" + userId,
            );
            if (version !== detailGeneration.current || !mounted.current)
                return;
            setDetail(d);
            setNote("");
            setDecision(
                d.estado === "CONTACTO" ? "FINALIZAR_CONTACTO" : "APROBAR",
            );
        } catch (e) {
            if (version === detailGeneration.current && mounted.current)
                setError(hrError(e));
        }
    }
    async function perform(action: () => Promise<void>) {
        if (flight.current) return;
        flight.current = true;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await action();
        } catch (e) {
            if (mounted.current) setError(hrError(e));
        } finally {
            flight.current = false;
            if (mounted.current) setBusy(false);
        }
    }
    const publication = useRef<{ key: string; inicio: string } | null>(null);
    async function create(event: FormEvent) {
        event.preventDefault();
        await perform(async () => {
            const key = JSON.stringify({
                name,
                description,
                mode,
                now,
                start: now ? null : start,
                end,
                fields,
            });
            if (!publication.current || publication.current.key !== key)
                publication.current = {
                    key,
                    inicio: now ? new Date().toISOString() : hrLocalIso(start),
                };

            const r = await platformCommand<{ id: string; convocados: number }>(
                "/hr/campaigns/create",
                "POST",
                {
                    data: {
                        nombre: name,
                        descripcion: description,
                        modo: mode,
                        inicio: publication.current.inicio,
                        fin: hrLocalIso(end),
                        campos: Object.values(fields),
                    },
                },
                admin,
                "Publicar campaña obligatoria de actualización de datos",
            );
            if (!mounted.current) return;
            publication.current = null;
            setCreating(false);
            setName("");
            setDescription("");
            setFields({});
            setSelected(r.id);
            setReportPage(0);
            setState("");
            setMessage(
                "Campaña publicada para " +
                    r.convocados +
                    " usuarios. La notificación se mostrará desde la apertura hasta que envíen su actualización.",
            );
            window.dispatchEvent(new Event("tickets-hr-updated"));
            await load();
        });
    }
    async function close() {
        if (!report) return;
        await perform(async () => {
            await platformCommand(
                "/hr/campaigns/" + selected + "/close",
                "POST",
                { version: report.campana.version },
                admin,
                "Cerrar el periodo de actualización de datos",
            );
            if (!mounted.current) return;
            setMessage(
                "Campaña cerrada. Los envíos recibidos siguen disponibles para revisión.",
            );
            window.dispatchEvent(new Event("tickets-hr-updated"));
            await Promise.all([load(), loadReport()]);
        });
    }
    async function review(event: FormEvent) {
        event.preventDefault();
        if (!detail) return;
        const userId = detail.usuarioId;
        await perform(async () => {
            await platformCommand(
                "/hr/campaigns/" + selected + "/users/" + userId + "/review",
                "POST",
                { version: detail.version, decision, observacion: note },
                admin,
                decision === "DEVOLVER"
                    ? "Devolver actualización para correcciones"
                    : decision === "FINALIZAR_CONTACTO"
                      ? "Registrar atención y finalizar revisión"
                      : "Revisar y aplicar datos del empleado",
            );
            if (!mounted.current) return;
            setMessage("Revisión registrada.");
            window.dispatchEvent(new Event("tickets-hr-updated"));
            await Promise.all([loadReport(), inspect(userId)]);
        });
    }
    const chosen = Object.keys(fields).length;
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <div>
                    <h2>Campañas de actualización de datos</h2>
                    <p className={styles.muted}>
                        Define el periodo y los campos; revisa el avance de
                        todos los usuarios convocados.
                    </p>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => void load()}
                    >
                        Actualizar campañas
                    </Button>
                    {actions.INSERTAR && (
                        <Button
                            state={busy ? "disabled" : "default"}
                            onClick={() => setCreating((v) => !v)}
                        >
                            {creating ? "Cerrar formulario" : "Nueva campaña"}
                        </Button>
                    )}
                </div>
            </div>
            {error && (
                <div role="alert" className={styles.error}>
                    {error}
                    <p>
                        Conservamos los datos del formulario. Consulta el estado
                        del registro antes de repetir una operación.
                    </p>
                    <Button
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => void (selected ? loadReport() : load())}
                    >
                        Reintentar consulta
                    </Button>
                </div>
            )}
            {message && (
                <p role="status" className={local.success}>
                    {message}
                </p>
            )}
            {creating && (
                <section
                    className={styles.card}
                    aria-label="Configurar campaña"
                >
                    <h3>Nueva campaña obligatoria</h3>
                    <form onSubmit={create}>
                        <fieldset disabled={busy} className={local.fieldset}>
                            <div className={local.formGrid}>
                                <div className={styles.field}>
                                    <label htmlFor="hr-c-name">
                                        Nombre de campaña *
                                    </label>
                                    <input
                                        id="hr-c-name"
                                        className={styles.control}
                                        required
                                        maxLength={150}
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="hr-c-mode">
                                        Aplicación de los campos editables
                                    </label>
                                    <select
                                        id="hr-c-mode"
                                        className={styles.control}
                                        value={mode}
                                        onChange={(e) =>
                                            setMode(e.target.value)
                                        }
                                    >
                                        <option value="CON_REVISION">
                                            RRHH aprueba antes de aplicar
                                        </option>
                                        <option value="AL_ENVIAR">
                                            Aplicar cuando el usuario envíe
                                        </option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="hr-c-description">
                                        Instrucciones para los usuarios *
                                    </label>
                                    <textarea
                                        id="hr-c-description"
                                        className={styles.control}
                                        required
                                        maxLength={2000}
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={now}
                                            onChange={(e) =>
                                                setNow(e.target.checked)
                                            }
                                        />{" "}
                                        Activar al publicar
                                    </label>
                                    <label htmlFor="hr-c-start">
                                        Fecha y hora de apertura
                                    </label>
                                    <input
                                        id="hr-c-start"
                                        className={styles.control}
                                        type="datetime-local"
                                        disabled={now}
                                        required={!now}
                                        value={start}
                                        onChange={(e) =>
                                            setStart(e.target.value)
                                        }
                                    />
                                    <span className={styles.muted}>
                                        Hora de Guatemala. Desmarca para
                                        programar una apertura futura.
                                    </span>
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="hr-c-end">
                                        Fecha y hora de cierre *
                                    </label>
                                    <input
                                        id="hr-c-end"
                                        className={styles.control}
                                        type="datetime-local"
                                        required
                                        value={end}
                                        onChange={(e) => setEnd(e.target.value)}
                                    />
                                    <span className={styles.muted}>
                                        No se aceptan envíos a partir de esta
                                        fecha y hora.
                                    </span>
                                </div>
                                <div className={styles.field}>
                                    <span>Plazos habituales</span>
                                    <div className={styles.actions}>
                                        {[
                                            ["1", "1 día"],
                                            ["3", "3 días"],
                                            ["7", "1 semana"],
                                            ["mes", "1 mes"],
                                        ].map(([period, label]) => (
                                            <Button
                                                key={period}
                                                variant="outlined"
                                                type="button"
                                                onClick={() => {
                                                    try {
                                                        setEnd(
                                                            hrLocalInput(
                                                                hrDeadline(
                                                                    now
                                                                        ? new Date()
                                                                        : new Date(
                                                                              hrLocalIso(
                                                                                  start,
                                                                              ),
                                                                          ),
                                                                    period,
                                                                ),
                                                            ),
                                                        );
                                                    } catch (e) {
                                                        setError(hrError(e));
                                                    }
                                                }}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <h3>Campos solicitados · {chosen} / 50</h3>
                            <p className={styles.muted}>
                                Solo los campos seleccionados aparecen en la
                                campaña. «Solo confirmar» exige confirmar el
                                dato o solicitar corrección con una observación.
                                Los datos laborales protegidos solo admiten
                                confirmación.
                            </p>
                            <div className={styles.field}>
                                <label htmlFor="hr-c-filter">
                                    Buscar campo
                                </label>
                                <input
                                    id="hr-c-filter"
                                    className={styles.control}
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                            <div className={local.fieldPicker}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Solicitar</th>
                                            <th>Dato</th>
                                            <th>Respuesta esperada</th>
                                            <th>Requerir valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {options
                                            .filter(
                                                (f) =>
                                                    f.tipo !== "archivo" &&
                                                    (
                                                        f.etiqueta +
                                                        " " +
                                                        f.codigo
                                                    )
                                                        .toLowerCase()
                                                        .includes(
                                                            filter.toLowerCase(),
                                                        ),
                                            )
                                            .map((f) => (
                                                <tr key={f.codigo}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            aria-label={
                                                                "Solicitar " +
                                                                f.etiqueta
                                                            }
                                                            checked={Boolean(
                                                                fields[
                                                                    f.codigo
                                                                ],
                                                            )}
                                                            disabled={
                                                                !fields[
                                                                    f.codigo
                                                                ] &&
                                                                chosen >= 50
                                                            }
                                                            onChange={(e) =>
                                                                setFields(
                                                                    (prior) => {
                                                                        const next =
                                                                            {
                                                                                ...prior,
                                                                            };
                                                                        if (
                                                                            e
                                                                                .target
                                                                                .checked
                                                                        )
                                                                            next[
                                                                                f.codigo
                                                                            ] =
                                                                                {
                                                                                    codigo: f.codigo,
                                                                                    modo: "CONFIRMAR",
                                                                                    obligatorio: true,
                                                                                };
                                                                        else
                                                                            delete next[
                                                                                f
                                                                                    .codigo
                                                                            ];
                                                                        return next;
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <th scope="row">
                                                        {f.etiqueta}
                                                        <small
                                                            className={
                                                                styles.muted
                                                            }
                                                        >
                                                            {" "}
                                                            · {f.codigo}
                                                        </small>
                                                    </th>
                                                    <td>
                                                        <select
                                                            className={
                                                                styles.control
                                                            }
                                                            aria-label={
                                                                "Modo de " +
                                                                f.etiqueta
                                                            }
                                                            disabled={
                                                                !fields[
                                                                    f.codigo
                                                                ]
                                                            }
                                                            value={
                                                                fields[f.codigo]
                                                                    ?.modo ||
                                                                "CONFIRMAR"
                                                            }
                                                            onChange={(e) =>
                                                                setFields(
                                                                    (
                                                                        prior,
                                                                    ) => ({
                                                                        ...prior,
                                                                        [f.codigo]:
                                                                            {
                                                                                ...prior[
                                                                                    f
                                                                                        .codigo
                                                                                ],
                                                                                modo: e
                                                                                    .target
                                                                                    .value as HrSelection["modo"],
                                                                            },
                                                                    }),
                                                                )
                                                            }
                                                        >
                                                            <option value="CONFIRMAR">
                                                                Solo confirmar
                                                            </option>
                                                            {f.editable && (
                                                                <option value="EDITAR">
                                                                    Permitir
                                                                    edición
                                                                </option>
                                                            )}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            aria-label={
                                                                "Requerir " +
                                                                f.etiqueta
                                                            }
                                                            type="checkbox"
                                                            disabled={
                                                                !fields[
                                                                    f.codigo
                                                                ] ||
                                                                fields[f.codigo]
                                                                    ?.modo ===
                                                                    "CONFIRMAR"
                                                            }
                                                            checked={Boolean(
                                                                fields[f.codigo]
                                                                    ?.obligatorio,
                                                            )}
                                                            onChange={(e) =>
                                                                setFields(
                                                                    (
                                                                        prior,
                                                                    ) => ({
                                                                        ...prior,
                                                                        [f.codigo]:
                                                                            {
                                                                                ...prior[
                                                                                    f
                                                                                        .codigo
                                                                                ],
                                                                                obligatorio:
                                                                                    e
                                                                                        .target
                                                                                        .checked,
                                                                            },
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className={styles.muted}>
                                Se convocará a las cuentas habilitadas de la
                                empresa 97 que existan al publicar. El grupo y
                                los campos quedarán fijados para conservar el
                                significado del reporte.
                            </p>
                            <Button
                                type="submit"
                                state={
                                    busy
                                        ? "loading"
                                        : !chosen
                                          ? "disabled"
                                          : "default"
                                }
                            >
                                Publicar y notificar campaña
                            </Button>
                        </fieldset>
                    </form>
                </section>
            )}
            <section className={styles.card} aria-label="Campañas publicadas">
                <h3>Campañas publicadas</h3>
                {!list && !error && <p role="status">Consultando campañas…</p>}
                {list && !list.items.length && (
                    <p>Aún no se han publicado campañas.</p>
                )}
                {list?.items.map((c) => (
                    <article className={local.campaign} key={c.id}>
                        <div>
                            <h3>{c.nombre}</h3>
                            <p>
                                {c.ventana === "ABIERTA"
                                    ? "Abierta"
                                    : c.ventana === "PROGRAMADA"
                                      ? "Programada"
                                      : "Cerrada"}{" "}
                                · {hrDate(c.inicio)} — {hrDate(c.fin)}
                            </p>
                            <p>
                                {c.modo === "AL_ENVIAR"
                                    ? "Aplicación al enviar"
                                    : "Con aprobación de RRHH"}
                            </p>
                        </div>
                        <Button
                            variant="outlined"
                            state={busy ? "disabled" : "default"}
                            onClick={() => {
                                setSelected(c.id);
                                setReportPage(0);
                                setState("");
                                setDetail(null);
                            }}
                        >
                            Ver avance y revisiones
                        </Button>
                    </article>
                ))}
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        state={page === 0 || busy ? "disabled" : "default"}
                        onClick={() => setPage((v) => Math.max(0, v - 50))}
                    >
                        Campañas anteriores
                    </Button>
                    <Button
                        variant="outlined"
                        state={!list?.hayMas || busy ? "disabled" : "default"}
                        onClick={() => setPage((v) => v + 50)}
                    >
                        Más campañas
                    </Button>
                </div>
            </section>
            {report && (
                <section className={styles.card} aria-label="Avance de campaña">
                    <div className={styles.toolbar}>
                        <div>
                            <h3>{report.campana.nombre} · Avance</h3>
                            <p>
                                {report.resumen.enviadas} de{" "}
                                {report.resumen.total} usuarios convocados
                                enviaron su actualización (
                                {report.resumen.porcentaje}%).
                            </p>
                        </div>
                        <div className={styles.actions}>
                            <Button
                                variant="outlined"
                                state={busy ? "disabled" : "default"}
                                onClick={() => void loadReport()}
                            >
                                Actualizar reporte
                            </Button>
                            {actions.INSERTAR &&
                                report.campana.ventana !== "CERRADA" && (
                                    <Button
                                        variant="outlined"
                                        state={busy ? "disabled" : "default"}
                                        onClick={() => void close()}
                                    >
                                        Cerrar campaña anticipadamente
                                    </Button>
                                )}
                        </div>
                    </div>
                    <progress
                        className={local.progress}
                        value={report.resumen.porcentaje}
                        max={100}
                        aria-label="Porcentaje de actualizaciones enviadas"
                    />
                    <div className={local.stats}>
                        {[
                            ["Pendientes de envío", report.resumen.pendientes],
                            [
                                "Aplicadas o confirmadas",
                                report.resumen.aplicadas,
                            ],
                            ["Revisadas por RRHH", report.resumen.revisadas],
                            ["Requieren contacto", report.resumen.contacto],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <span>{label}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>
                    <p className={styles.muted}>
                        El 100% corresponde al grupo convocado al publicar.
                        «Enviadas» excluye las devueltas para corrección;
                        «Aplicadas» y «Revisadas» muestran pasos diferentes.
                    </p>
                    <div className={styles.field}>
                        <label htmlFor="hr-report-state">
                            Filtrar usuarios por estado
                        </label>
                        <select
                            id="hr-report-state"
                            className={styles.control}
                            value={state}
                            disabled={busy}
                            onChange={(e) => {
                                setState(e.target.value);
                                setReportPage(0);
                            }}
                        >
                            <option value="">Todos los estados</option>
                            {Object.entries(HR_STATES).map(([value, label]) => (
                                <option value={value} key={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.tableRegion}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Código empleado</th>
                                    <th>Estado</th>
                                    <th>Enviado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.items.map((r) => (
                                    <tr key={r.usuarioId}>
                                        <td>
                                            {r.nombre ||
                                                "Usuario " + r.usuarioId}
                                        </td>
                                        <td>
                                            {r.empleado ?? "Vínculo pendiente"}
                                        </td>
                                        <td>{HR_STATES[r.estado]}</td>
                                        <td>{hrDate(r.enviadoEn)}</td>
                                        <td>
                                            <Button
                                                variant="text"
                                                state={
                                                    busy
                                                        ? "disabled"
                                                        : "default"
                                                }
                                                onClick={() =>
                                                    void inspect(r.usuarioId)
                                                }
                                            >
                                                Ver actualización
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!report.items.length && (
                            <p>No hay usuarios para el filtro aplicado.</p>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <Button
                            variant="outlined"
                            state={
                                busy || reportPage === 0
                                    ? "disabled"
                                    : "default"
                            }
                            onClick={() =>
                                setReportPage((v) => Math.max(0, v - 50))
                            }
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outlined"
                            state={
                                busy || !report.hayMas ? "disabled" : "default"
                            }
                            onClick={() => setReportPage((v) => v + 50)}
                        >
                            Siguiente
                        </Button>
                    </div>
                </section>
            )}
            {detail && (
                <section
                    className={styles.card}
                    aria-label="Revisar actualización"
                >
                    <div className={styles.toolbar}>
                        <h3>Actualización de {detail.nombre}</h3>
                        <Button
                            variant="outlined"
                            state={busy ? "disabled" : "default"}
                            onClick={() => setDetail(null)}
                        >
                            Cerrar revisión
                        </Button>
                    </div>
                    <p>
                        Contacto registrado:{" "}
                        {detail.contacto?.telefono || "Teléfono no disponible"}{" "}
                        · {detail.contacto?.correo || "Correo no disponible"}
                    </p>
                    <HrSubmission data={detail} />
                    {detail.entrega && detail.entrega.revision > 1 && (
                        <HrDeliveryHistory
                            key={selected + detail.usuarioId}
                            campaign={detail.campana}
                            userId={detail.usuarioId}
                        />
                    )}
                    {detail.entrega &&
                        actions.EDITAR &&
                        ["ENVIADA", "APLICADA", "CONTACTO"].includes(
                            detail.estado,
                        ) && (
                            <form onSubmit={review}>
                                <fieldset
                                    disabled={busy}
                                    className={local.fieldset}
                                >
                                    <legend>Registrar revisión de RRHH</legend>
                                    <div className={local.formGrid}>
                                        <div className={styles.field}>
                                            <label htmlFor="hr-decision">
                                                Decisión
                                            </label>
                                            <select
                                                id="hr-decision"
                                                className={styles.control}
                                                value={decision}
                                                onChange={(e) =>
                                                    setDecision(e.target.value)
                                                }
                                            >
                                                {detail.estado ===
                                                "CONTACTO" ? (
                                                    <option value="FINALIZAR_CONTACTO">
                                                        Finalizar atención de
                                                        los datos observados
                                                    </option>
                                                ) : (
                                                    <>
                                                        <option value="APROBAR">
                                                            {detail.estado ===
                                                            "APLICADA"
                                                                ? "Marcar como revisada"
                                                                : "Aprobar y aplicar campos editables"}
                                                        </option>
                                                        <option value="SOLICITAR_CONTACTO">
                                                            Solicitar atención
                                                            de RRHH sin aplicar
                                                            cambios
                                                        </option>
                                                        {detail.campana
                                                            .ventana ===
                                                            "ABIERTA" &&
                                                            detail.estado ===
                                                                "ENVIADA" && (
                                                                <option value="DEVOLVER">
                                                                    Devolver
                                                                    para
                                                                    correcciones
                                                                </option>
                                                            )}
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div className={styles.field}>
                                            <label htmlFor="hr-review-note">
                                                Observación de RRHH (visible
                                                para el usuario) *
                                            </label>
                                            <textarea
                                                id="hr-review-note"
                                                className={styles.control}
                                                required
                                                maxLength={2000}
                                                value={note}
                                                onChange={(e) =>
                                                    setNote(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    {detail.estado === "CONTACTO" && (
                                        <p>
                                            Contacta con el empleado y atiende
                                            los datos de solo confirmación en el
                                            sistema oficial de RRHH. Registra
                                            aquí cómo se resolvió antes de
                                            finalizar la atención.
                                        </p>
                                    )}
                                    <Button
                                        type="submit"
                                        state={busy ? "loading" : "default"}
                                    >
                                        Registrar revisión
                                    </Button>
                                </fieldset>
                            </form>
                        )}
                </section>
            )}
        </div>
    );
}
