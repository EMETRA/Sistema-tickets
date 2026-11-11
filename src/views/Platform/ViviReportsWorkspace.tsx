"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { MetricCard } from "@/components/client/molecules/MetricCard";
import { platformFetch, PlatformError } from "@/platform/client";
import {
    emptyViviActivity,
    emptyViviUsers,
    viviNoticeStates,
    viviReportStates,
    viviReportCsv,
    viviReportQuery,
    viviStateLabel,
    type ViviActivityFilters,
    type ViviActivityReport,
    type ViviUser,
    type ViviUserDetail,
    type ViviUsersFilters,
    type ViviUsersReport,
} from "@/platform/vivi-reports";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./ViviReportsWorkspace.module.scss";

type Kind = "users" | "activity";
const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Fecha no disponible"
        : date.toLocaleString("es-GT", {
              timeZone: "America/Guatemala",
              dateStyle: "medium",
              timeStyle: "short",
          });
};
const fullName = (user: ViviUser) => `${user.nombres} ${user.apellidos}`.trim();
const errorText = (error: unknown) =>
    (error instanceof Error
        ? error.message
        : "No se pudo consultar el reporte.") +
    (error instanceof PlatformError && error.reference
        ? ` Referencia: ${error.reference}`
        : "");
export function ViviReportsWorkspace() {
    const [kind, setKind] = useState<Kind>("users");
    const [userFilters, setUserFilters] = useState<ViviUsersFilters>({
        ...emptyViviUsers,
    });
    const [activityFilters, setActivityFilters] = useState<ViviActivityFilters>(
        { ...emptyViviActivity },
    );
    const [users, setUsers] = useState<ViviUsersReport | null>(null);
    const [activity, setActivity] = useState<ViviActivityReport | null>(null);
    const [appliedUsers, setAppliedUsers] = useState<ViviUsersFilters | null>(
        null,
    );
    const [appliedActivity, setAppliedActivity] =
        useState<ViviActivityFilters | null>(null);
    const [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const [detail, setDetail] = useState<ViviUserDetail | null>(null);
    const [detailId, setDetailId] = useState(""),
        [detailBusy, setDetailBusy] = useState(false),
        [detailError, setDetailError] = useState("");
    const [selectedName, setSelectedName] = useState("");
    const request = useRef<AbortController | null>(null),
        detailRequest = useRef<AbortController | null>(null);
    const detailSection = useRef<HTMLElement>(null);
    const result = kind === "users" ? users : activity;
    const currentFilters = kind === "users" ? userFilters : activityFilters;
    const applied = kind === "users" ? appliedUsers : appliedActivity;
    const changed =
        applied && JSON.stringify(currentFilters) !== JSON.stringify(applied);
    async function load(
        target: Kind,
        offset = 0,
        filters = target === "users" ? userFilters : activityFilters,
    ) {
        let path: string;
        try {
            path = viviReportQuery(target, filters, offset);
        } catch (failure) {
            setError(errorText(failure));
            return;
        }
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setBusy(true);
        setError("");
        try {
            const report = await platformFetch<
                ViviUsersReport | ViviActivityReport
            >(path, {
                signal: AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(45000),
                ]),
            });
            if (
                !report ||
                !Array.isArray(report.items) ||
                !report.resumen ||
                !Number.isSafeInteger(report.resumen.total) ||
                !Number.isSafeInteger(report.offset) ||
                report.limite !== 50 ||
                typeof report.hayMas !== "boolean"
            )
                throw Error("La respuesta del reporte no es válida.");
            if (controller.signal.aborted) return;
            if (target === "users") {
                setUsers(report as ViviUsersReport);
                setAppliedUsers({ ...filters } as ViviUsersFilters);
            } else {
                setActivity(report as ViviActivityReport);
                setAppliedActivity({ ...filters } as ViviActivityFilters);
            }
        } catch (failure) {
            if (!controller.signal.aborted) setError(errorText(failure));
        } finally {
            if (!controller.signal.aborted) setBusy(false);
        }
    }
    useEffect(() => {
        void load("users");
        return () => {
            request.current?.abort();
            detailRequest.current?.abort();
        };
        // Los filtros se aplican con Consultar; no consultar mientras se escriben.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    function closeDetail() {
        detailRequest.current?.abort();
        setDetail(null);
        setDetailId("");
        setDetailBusy(false);
        setDetailError("");
    }
    function switchKind(target: Kind) {
        setKind(target);
        closeDetail();
        void load(target);
    }
    async function showUser(id: string) {
        detailRequest.current?.abort();
        const controller = new AbortController();
        detailRequest.current = controller;
        setDetail(null);
        setDetailId(id);
        setDetailBusy(true);
        setDetailError("");
        try {
            const user = await platformFetch<ViviUserDetail>(
                "/vivi-reports/users/" + encodeURIComponent(id),
                {
                    signal: AbortSignal.any([
                        controller.signal,
                        AbortSignal.timeout(45000),
                    ]),
                },
            );
            if (!user || user.id !== id || typeof user.nombres !== "string")
                throw Error("La ficha del usuario no es válida.");
            if (!controller.signal.aborted) setDetail(user);
        } catch (failure) {
            if (!controller.signal.aborted) setDetailError(errorText(failure));
        } finally {
            if (!controller.signal.aborted) {
                setDetailBusy(false);
                detailSection.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }
    }
    function showActivity(user: ViviUser) {
        const filters = { ...emptyViviActivity, usuarioId: user.id };
        setActivityFilters(filters);
        setSelectedName(fullName(user));
        setKind("activity");
        closeDetail();
        void load("activity", 0, filters);
    }
    function exportPage() {
        if (!result || !result.items.length || busy || error) return;
        const url = URL.createObjectURL(
            new Blob([viviReportCsv(result, kind)], {
                type: "text/csv;charset=utf-8",
            }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `vivi-${kind}-pagina-${Math.floor(result.offset / result.limite) + 1}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }
    return (
        <div className={local.workspace}>
            <p className={styles.muted}>
                Consulta las cuentas inscritas y la actividad registrada en
                VIVI. Los avisos vehiculares y los reportes de incidentes se
                muestran por separado.
            </p>
            <nav className={styles.tabs} aria-label="Tipo de reporte VIVI">
                <button
                    type="button"
                    aria-current={kind === "users" ? "page" : undefined}
                    onClick={() => switchKind("users")}
                >
                    Usuarios inscritos
                </button>
                <button
                    type="button"
                    aria-current={kind === "activity" ? "page" : undefined}
                    onClick={() => switchKind("activity")}
                >
                    Avisos y reportes
                </button>
            </nav>
            <form
                className={styles.card}
                aria-label="Filtros del reporte"
                onSubmit={(event) => {
                    event.preventDefault();
                    closeDetail();
                    void load(kind);
                }}
            >
                <h2>
                    {kind === "users"
                        ? "Buscar usuarios"
                        : "Consultar actividad"}
                </h2>
                <div className={local.filters}>
                    {kind === "users" ? (
                        <>
                            <label className={local.search}>
                                Nombre, correo, teléfono o ID
                                <input
                                    name="q"
                                    value={userFilters.q}
                                    maxLength={100}
                                    onChange={(e) =>
                                        setUserFilters({
                                            ...userFilters,
                                            q: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <label>
                                Estado de cuenta
                                <select
                                    value={userFilters.estado}
                                    onChange={(e) =>
                                        setUserFilters({
                                            ...userFilters,
                                            estado: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Todas</option>
                                    <option value="ACTIVO">Activas</option>
                                    <option value="INACTIVO">Inactivas</option>
                                </select>
                            </label>
                            <label>
                                Actividad del usuario
                                <select
                                    value={userFilters.actividad}
                                    onChange={(e) =>
                                        setUserFilters({
                                            ...userFilters,
                                            actividad: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Todos</option>
                                    <option value="CON_ACTIVIDAD">
                                        Con avisos o reportes
                                    </option>
                                    <option value="SIN_ACTIVIDAD">
                                        Sin avisos ni reportes
                                    </option>
                                </select>
                            </label>
                        </>
                    ) : (
                        <>
                            <label className={local.search}>
                                ID de usuario VIVI (opcional)
                                <input
                                    inputMode="numeric"
                                    value={activityFilters.usuarioId}
                                    maxLength={19}
                                    onChange={(e) => {
                                        setSelectedName("");
                                        setActivityFilters({
                                            ...activityFilters,
                                            usuarioId: e.target.value,
                                        });
                                    }}
                                />
                            </label>
                            <label>
                                Tipo de registro
                                <select
                                    value={activityFilters.tipo}
                                    onChange={(e) =>
                                        setActivityFilters({
                                            ...activityFilters,
                                            tipo: e.target.value,
                                            estado: "",
                                        })
                                    }
                                >
                                    <option value="">Avisos y reportes</option>
                                    <option value="AVISO">
                                        Avisos vehiculares
                                    </option>
                                    <option value="REPORTE">
                                        Reportes de incidentes
                                    </option>
                                </select>
                            </label>
                            <label>
                                Estado del registro
                                <select
                                    value={activityFilters.estado}
                                    onChange={(e) =>
                                        setActivityFilters({
                                            ...activityFilters,
                                            estado: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Todos</option>
                                    {[
                                        ...(activityFilters.tipo !== "REPORTE"
                                            ? viviNoticeStates
                                            : []),
                                        ...(activityFilters.tipo !== "AVISO"
                                            ? viviReportStates
                                            : []),
                                    ].map((s) => (
                                        <option key={s} value={s}>
                                            {viviStateLabel(s)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </>
                    )}
                    <label>
                        {kind === "users"
                            ? "Inscritos desde"
                            : "Grabados desde"}
                        <input
                            type="date"
                            value={currentFilters.desde}
                            onChange={(e) =>
                                kind === "users"
                                    ? setUserFilters({
                                          ...userFilters,
                                          desde: e.target.value,
                                      })
                                    : setActivityFilters({
                                          ...activityFilters,
                                          desde: e.target.value,
                                      })
                            }
                        />
                    </label>
                    <label>
                        Hasta
                        <input
                            type="date"
                            value={currentFilters.hasta}
                            onChange={(e) =>
                                kind === "users"
                                    ? setUserFilters({
                                          ...userFilters,
                                          hasta: e.target.value,
                                      })
                                    : setActivityFilters({
                                          ...activityFilters,
                                          hasta: e.target.value,
                                      })
                            }
                        />
                    </label>
                    <Button type="submit" state={busy ? "disabled" : "default"}>
                        {busy ? "Consultando…" : "Consultar"}
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => {
                            closeDetail();
                            setSelectedName("");
                            if (kind === "users") {
                                setUserFilters({ ...emptyViviUsers });
                                void load(kind, 0, emptyViviUsers);
                            } else {
                                setActivityFilters({ ...emptyViviActivity });
                                void load(kind, 0, emptyViviActivity);
                            }
                        }}
                    >
                        Limpiar filtros
                    </Button>
                </div>
                <p className={styles.muted}>
                    Fechas y horas de Guatemala. Sin fechas se incluye todo el
                    historial.{" "}
                    {kind === "users"
                        ? "Los contadores por usuario incluyen toda su actividad, independientemente de su fecha de inscripción."
                        : "El periodo corresponde a cuándo se guardó el registro, no a la captura de su evidencia."}
                </p>
                {kind === "activity" && selectedName && (
                    <p>
                        Actividad de <strong>{selectedName}</strong> · ID{" "}
                        {activityFilters.usuarioId}
                    </p>
                )}
                {changed && (
                    <p className={styles.muted}>
                        Hay cambios de filtros sin aplicar. Pulsa Consultar para
                        actualizar los resultados.
                    </p>
                )}
            </form>
            {error && (
                <div role="alert" className={styles.error}>
                    <p>{error}</p>
                    {result && (
                        <p>Se conservan los últimos resultados confirmados.</p>
                    )}
                    <Button variant="outlined" onClick={() => void load(kind)}>
                        Reintentar consulta
                    </Button>
                </div>
            )}
            {busy && <p role="status">Consultando datos de VIVI…</p>}
            {result && (
                <section
                    aria-label="Resultados del reporte"
                    aria-busy={busy}
                    className={local.results}
                >
                    <div className={styles.metrics}>
                        {kind === "users" && users ? (
                            <>
                                <MetricCard
                                    label="Usuarios inscritos"
                                    value={users.resumen.total}
                                    caption="Según los filtros aplicados"
                                />
                                <MetricCard
                                    label="Cuentas activas"
                                    value={users.resumen.activos}
                                />
                                <MetricCard
                                    label="Cuentas inactivas"
                                    value={users.resumen.inactivos}
                                />
                                <MetricCard
                                    label="Con avisos o reportes"
                                    value={users.resumen.conActividad}
                                />
                                <MetricCard
                                    label="Sin avisos ni reportes"
                                    value={users.resumen.sinActividad}
                                />
                            </>
                        ) : (
                            activity && (
                                <>
                                    <MetricCard
                                        label="Registros"
                                        value={activity.resumen.total}
                                        caption="Según los filtros aplicados"
                                    />
                                    <MetricCard
                                        label="Avisos vehiculares"
                                        value={activity.resumen.avisos}
                                    />
                                    <MetricCard
                                        label="Reportes de incidentes"
                                        value={activity.resumen.reportes}
                                    />
                                </>
                            )
                        )}
                    </div>
                    {kind === "activity" &&
                        activity &&
                        activity.resumen.estados.length > 0 && (
                            <div
                                className={local.states}
                                aria-label="Distribución por estado"
                            >
                                {activity.resumen.estados.map((s) => (
                                    <span key={s.tipo + s.estado}>
                                        {s.tipo === "AVISO"
                                            ? "Avisos"
                                            : "Reportes"}{" "}
                                        · {viviStateLabel(s.estado)}{" "}
                                        <strong>{s.cantidad}</strong>
                                    </span>
                                ))}
                            </div>
                        )}
                    <div className={styles.card}>
                        <header className={local.heading}>
                            <div>
                                <h2>
                                    {kind === "users"
                                        ? "Usuarios registrados"
                                        : "Actividad registrada"}
                                </h2>
                                <p className={styles.muted}>
                                    {applied?.desde || "Inicio del historial"} →{" "}
                                    {applied?.hasta || "Sin fecha final"} ·{" "}
                                    {result.resumen.total} resultados
                                </p>
                            </div>
                            <Button
                                variant="outlined"
                                onClick={exportPage}
                                state={
                                    !result.items.length ||
                                    busy ||
                                    Boolean(error)
                                        ? "disabled"
                                        : "default"
                                }
                            >
                                Exportar esta página CSV
                            </Button>
                        </header>
                        {result.items.length === 0 ? (
                            <p className={local.empty}>
                                {result.resumen.total > 0
                                    ? "Esta página ya no contiene registros. Vuelve a consultar desde la primera página."
                                    : "No hay resultados para los filtros aplicados."}
                            </p>
                        ) : (
                            <div
                                className={styles.tableRegion}
                                tabIndex={0}
                                role="region"
                                aria-label={
                                    kind === "users"
                                        ? "Lista de usuarios VIVI"
                                        : "Lista de avisos y reportes"
                                }
                            >
                                {kind === "users" && users ? (
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Usuario</th>
                                                <th>Contacto de registro</th>
                                                <th>Cuenta</th>
                                                <th>Inscripción</th>
                                                <th>Avisos</th>
                                                <th>Reportes</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.items.map((u) => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <strong>
                                                            {fullName(u)}
                                                        </strong>
                                                        <small
                                                            className={
                                                                local.sub
                                                            }
                                                        >
                                                            ID {u.id}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        {u.correo}
                                                        <small
                                                            className={
                                                                local.sub
                                                            }
                                                        >
                                                            {u.telefono}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                local.badge
                                                            }
                                                        >
                                                            {u.activo
                                                                ? "Activa"
                                                                : "Inactiva"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {formatDate(
                                                            u.registradoEn,
                                                        )}
                                                    </td>
                                                    <td>{u.avisos}</td>
                                                    <td>{u.reportes}</td>
                                                    <td>
                                                        <div
                                                            className={
                                                                styles.actions
                                                            }
                                                        >
                                                            <Button
                                                                variant="text"
                                                                onClick={() =>
                                                                    void showUser(
                                                                        u.id,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    "Ver datos de " +
                                                                    fullName(u)
                                                                }
                                                            >
                                                                Ver datos
                                                            </Button>
                                                            <Button
                                                                variant="text"
                                                                onClick={() =>
                                                                    showActivity(
                                                                        u,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    "Ver actividad de " +
                                                                    fullName(u)
                                                                }
                                                            >
                                                                Ver actividad
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    activity && (
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Registro</th>
                                                    <th>Usuario</th>
                                                    <th>Motivo o incidente</th>
                                                    <th>Placa</th>
                                                    <th>Estado</th>
                                                    <th>Grabado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activity.items.map((e) => (
                                                    <tr key={e.tipo + e.id}>
                                                        <td>
                                                            <strong>
                                                                {e.tipo ===
                                                                "AVISO"
                                                                    ? "Aviso vehicular"
                                                                    : "Reporte de incidente"}{" "}
                                                                #{e.id}
                                                            </strong>
                                                            {e.codigoCaso && (
                                                                <small
                                                                    className={
                                                                        local.case
                                                                    }
                                                                >
                                                                    {
                                                                        e.codigoCaso
                                                                    }
                                                                </small>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {e.usuario ||
                                                                "Usuario no disponible"}
                                                            <small
                                                                className={
                                                                    local.sub
                                                                }
                                                            >
                                                                {e.usuarioId
                                                                    ? "ID " +
                                                                      e.usuarioId
                                                                    : "Sin vínculo de usuario"}
                                                            </small>
                                                        </td>
                                                        <td>{e.motivo}</td>
                                                        <td>
                                                            {e.placa
                                                                ? `${e.usoPlaca || ""} - ${e.placa}`
                                                                : "No aplica"}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={
                                                                    local.badge
                                                                }
                                                            >
                                                                {viviStateLabel(
                                                                    e.estado,
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {formatDate(
                                                                e.registradoEn,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )
                                )}
                            </div>
                        )}
                        <footer className={local.pagination}>
                            <p className={styles.muted}>
                                {result.items.length
                                    ? `${result.offset + 1}–${result.offset + result.items.length}`
                                    : "0"}{" "}
                                de {result.resumen.total} · Páginas de hasta{" "}
                                {result.limite}
                            </p>
                            <div className={styles.actions}>
                                <Button
                                    variant="outlined"
                                    state={
                                        busy ||
                                        result.offset === 0 ||
                                        Boolean(error)
                                            ? "disabled"
                                            : "default"
                                    }
                                    onClick={() =>
                                        void load(
                                            kind,
                                            Math.max(
                                                0,
                                                result.offset - result.limite,
                                            ),
                                            applied!,
                                        )
                                    }
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outlined"
                                    state={
                                        busy || !result.hayMas || Boolean(error)
                                            ? "disabled"
                                            : "default"
                                    }
                                    onClick={() =>
                                        void load(
                                            kind,
                                            result.offset + result.limite,
                                            applied!,
                                        )
                                    }
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </footer>
                    </div>
                </section>
            )}
            {detailId && (
                <section
                    ref={detailSection}
                    className={styles.card}
                    aria-label="Datos de inscripción"
                >
                    <header className={local.heading}>
                        <h2>Datos de inscripción · Usuario {detailId}</h2>
                        <Button variant="outlined" onClick={closeDetail}>
                            Cerrar ficha
                        </Button>
                    </header>
                    {detailBusy && <p role="status">Cargando ficha…</p>}
                    {detailError && (
                        <div role="alert">
                            <p>{detailError}</p>
                            <Button
                                variant="outlined"
                                onClick={() => void showUser(detailId)}
                            >
                                Reintentar ficha
                            </Button>
                        </div>
                    )}
                    {detail && (
                        <>
                            <p className={styles.muted}>
                                Datos declarados por el usuario. La placa del
                                perfil no acredita propiedad del vehículo. Sexo,
                                etnia y ubicación conservan los códigos del
                                registro.
                            </p>
                            <dl className={local.details}>
                                {[
                                    ["Nombres", detail.nombres],
                                    ["Apellidos", detail.apellidos],
                                    ["Correo", detail.correo],
                                    ["Teléfono", detail.telefono],
                                    [
                                        "Cuenta",
                                        detail.activo ? "Activa" : "Inactiva",
                                    ],
                                    [
                                        "Inscripción",
                                        formatDate(detail.registradoEn),
                                    ],
                                    ["DPI", detail.dpi],
                                    ["NIT", detail.nit],
                                    [
                                        "Fecha de nacimiento",
                                        detail.fechaNacimiento,
                                    ],
                                    ["Sexo (código)", detail.sexo],
                                    ["Etnia (código)", detail.etnia],
                                    ["País ISO", detail.pais],
                                    [
                                        "Departamento (código)",
                                        detail.departamento,
                                    ],
                                    ["Municipio (código)", detail.municipio],
                                    ["Zona", detail.zona],
                                    ["Dirección", detail.direccion],
                                    [
                                        "Placa declarada",
                                        [
                                            detail.tipoPlacaDeclarada,
                                            detail.placaDeclarada,
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || null,
                                    ],
                                    ["Avisos vehiculares", detail.avisos],
                                    ["Reportes de incidentes", detail.reportes],
                                ].map(([label, value]) => (
                                    <div key={String(label)}>
                                        <dt>{label}</dt>
                                        <dd>{value ?? "No registrado"}</dd>
                                    </div>
                                ))}
                            </dl>
                            <Button onClick={() => showActivity(detail)}>
                                Consultar actividad de este usuario
                            </Button>
                        </>
                    )}
                </section>
            )}
        </div>
    );
}
