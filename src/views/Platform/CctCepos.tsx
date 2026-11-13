"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import {
    CCT_STATES,
    cctCivilNow,
    cctQuery,
    type CctBootstrap,
    type CctCepo,
    type CctPage,
    type CctRow,
} from "@/platform/cct";
import { CctData, CctPager, CctPicker, CctTable, cctError } from "./CctParts";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./CctWorkspace.module.scss";
const originNames = [
    "MUNIINGRESOS",
    "CAFÉ",
    "BI",
    "GYT",
    "UNO",
    "Origen 6",
    "VISA",
    "BANRURAL",
    "BANCREDIT",
    "PRONET",
    "BANTRAB",
];
function CreateCepo({
    admin,
    onDone,
    onCancel,
}: {
    admin: boolean;
    onDone: (id: string) => void;
    onCancel: () => void;
}) {
    const [plate, setPlate] = useState({ tipoPlaca: "P", placa: "" }),
        [matches, setMatches] = useState<CctRow[] | null>(null),
        [vehicle, setVehicle] = useState<CctRow | null>(null),
        [register, setRegister] = useState(false),
        [car, setCarRaw] = useState<Record<string, string>>({
            tipoVehiculo: "",
            marca: "",
            color: "",
            modelo: "",
            chassis: "",
            vin: "",
        }),
        [form, setFormRaw] = useState<Record<string, string>>({
            crucero: "",
            tipoAgente: "",
            agente: "",
            delegacion: "",
            motivo: "",
            cepoFisico: "",
            fecha: cctCivilNow(),
            observaciones: "",
        }),
        [accepted, setAccepted] = useState(false),
        [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [message, setMessage] = useState("");
    function setCar(value: React.SetStateAction<Record<string, string>>) {
        setCarRaw(value);
        setAccepted(false);
    }
    function setForm(value: React.SetStateAction<Record<string, string>>) {
        setFormRaw(value);
        setAccepted(false);
    }
    const flight = useRef(false),
        request = useRef<AbortController | null>(null),
        active = useRef(true);
    useEffect(() => {
        active.current = true;
        return () => {
            active.current = false;
            request.current?.abort();
        };
    }, []);
    async function lookup() {
        request.current?.abort();
        const ctl = new AbortController();
        request.current = ctl;
        setBusy(true);
        setError("");
        try {
            const r = await platformFetch<{ items: CctRow[] }>(
                "/cct/vehiculos/referencias?" + cctQuery(plate),
                { signal: ctl.signal },
            );
            if (ctl.signal.aborted) return;
            setMatches(r.items);
            setVehicle(null);
            setAccepted(false);
            setRegister(false);
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setBusy(false);
        }
    }
    async function sat() {
        setBusy(true);
        setError("");
        try {
            const r = await platformFetch<Record<string, string>>(
                "/cct/vehiculos/sat?" +
                    cctQuery({
                        uso:
                            plate.tipoPlaca.length === 1
                                ? plate.tipoPlaca + "0"
                                : plate.tipoPlaca,
                        placa: plate.placa,
                    }),
            );
            if (active.current) {
                setCar((c) => ({
                    ...c,
                    marca: r.marca || "",
                    color: r.color || "",
                    modelo: r.modelo || "",
                }));
                setMessage(
                    "Datos SAT recuperados. Revisa el tipo de vehículo y los datos antes de registrar.",
                );
            }
        } catch (e) {
            if (active.current) setError(cctError(e));
        } finally {
            if (active.current) setBusy(false);
        }
    }
    async function saveVehicle(e: React.FormEvent) {
        e.preventDefault();
        if (flight.current || !accepted) return;
        flight.current = true;
        setBusy(true);
        setError("");
        try {
            const r = await platformCommand<{
                tipoVehiculo: string;
                vehiculo: string;
            }>(
                "/cct/vehiculos/registrar",
                "POST",
                { data: { ...plate, ...car } },
                admin,
                "Registrar vehículo en CCT",
            );
            if (!active.current) return;
            const selected = {
                ...car,
                TIPO_VEHICULO: r.tipoVehiculo,
                VEHICULO: r.vehiculo,
                TPLACA: plate.tipoPlaca,
                NPLACA: plate.placa,
                MARCA: car.marca,
                COLOR: car.color,
                MODELO: car.modelo,
            };
            setMatches([selected]);
            setVehicle(selected);
            setRegister(false);
            setAccepted(false);
            setMessage("Vehículo registrado. Completa los datos del cepo.");
        } catch (e) {
            if (active.current) setError(cctError(e));
        } finally {
            flight.current = false;
            if (active.current) setBusy(false);
        }
    }
    async function create(e: React.FormEvent) {
        e.preventDefault();
        if (flight.current || !accepted || !vehicle) return;
        flight.current = true;
        setBusy(true);
        setError("");
        try {
            const r = await platformCommand<{ aviso: string }>(
                "/cct/cepos/crear",
                "POST",
                {
                    data: {
                        ...form,
                        tipoVehiculo: vehicle.TIPO_VEHICULO,
                        vehiculo: vehicle.VEHICULO,
                    },
                },
                admin,
                "Registrar nuevo aviso de cepo",
            );
            if (active.current) onDone(r.aviso);
        } catch (e) {
            if (active.current) setError(cctError(e));
        } finally {
            flight.current = false;
            if (active.current) setBusy(false);
        }
    }
    return (
        <section className={styles.card} aria-label="Registrar nuevo cepo">
            <div className={styles.toolbar}>
                <h2>Registrar nuevo aviso de cepo</h2>
                <Button
                    variant="outlined"
                    state={busy ? "disabled" : "default"}
                    onClick={onCancel}
                >
                    Volver a consultar cepos
                </Button>
            </div>
            <p className={local.hint}>
                Primero identifica el vehículo. Después completa la colocación y
                revisa los datos.
            </p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void lookup();
                }}
            >
                <div className={local.form}>
                    {[
                        ["tipoPlaca", "Tipo de placa"],
                        ["placa", "Placa"],
                    ].map(([key, label]) => (
                        <div key={key}>
                            <label htmlFor={"cct-new-" + key}>{label} *</label>
                            <input
                                id={"cct-new-" + key}
                                className={styles.control}
                                required
                                maxLength={key === "tipoPlaca" ? 3 : 20}
                                value={plate[key as keyof typeof plate]}
                                disabled={busy}
                                onChange={(e) => {
                                    setPlate((p) => ({
                                        ...p,
                                        [key]: e.target.value.toUpperCase(),
                                    }));
                                    setMatches(null);
                                    setVehicle(null);
                                    setAccepted(false);
                                    setRegister(false);
                                }}
                            />
                        </div>
                    ))}
                </div>
                <Button
                    type="submit"
                    variant="outlined"
                    state={busy ? "disabled" : "default"}
                >
                    Buscar vehículo
                </Button>
            </form>
            {matches && (
                <section>
                    <h3>Selecciona el vehículo</h3>
                    {matches.map((row) => (
                        <label
                            className={local.vehicle}
                            key={row.TIPO_VEHICULO + ":" + row.VEHICULO}
                        >
                            <input
                                type="radio"
                                name="cct-vehicle"
                                checked={vehicle === row}
                                onChange={() => {
                                    setVehicle(row);
                                    setAccepted(false);
                                    setRegister(false);
                                }}
                            />
                            {row.TPLACA} {row.NPLACA} · {row.MARCA} ·{" "}
                            {row.MODELO}
                            <small>
                                Color: {row.COLOR} · Tipo {row.TIPO_VEHICULO} ·
                                Referencia {row.VEHICULO}
                            </small>
                        </label>
                    ))}
                    {!matches.length && (
                        <>
                            <p className={local.empty}>
                                No hay un vehículo registrado con esta placa.
                            </p>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setRegister(true);
                                    setAccepted(false);
                                }}
                            >
                                Registrar vehículo no encontrado
                            </Button>
                        </>
                    )}
                </section>
            )}
            {register && (
                <section className={local.review}>
                    <h3>Registrar vehículo</h3>
                    <Button
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => void sat()}
                    >
                        Consultar datos SAT
                    </Button>
                    <form onSubmit={saveVehicle}>
                        <div className={local.form}>
                            <CctPicker
                                kind="tipos"
                                label="Tipo de vehículo"
                                value={car.tipoVehiculo}
                                onChange={(v) =>
                                    setCar((c) => ({ ...c, tipoVehiculo: v }))
                                }
                                disabled={busy}
                            />
                            {[
                                ["marca", "Marca", 30],
                                ["color", "Color", 100],
                                ["modelo", "Modelo", 4],
                                ["chassis", "Chasis", 30],
                                ["vin", "VIN", 30],
                            ].map(([key, label, max]) => (
                                <div key={key}>
                                    <label htmlFor={"cct-car-" + key}>
                                        {label}
                                        {["marca", "color", "modelo"].includes(
                                            String(key),
                                        )
                                            ? " *"
                                            : ""}
                                    </label>
                                    <input
                                        id={"cct-car-" + key}
                                        className={styles.control}
                                        maxLength={Number(max)}
                                        required={[
                                            "marca",
                                            "color",
                                            "modelo",
                                        ].includes(String(key))}
                                        value={car[String(key)] || ""}
                                        disabled={busy}
                                        onChange={(e) =>
                                            setCar((c) => ({
                                                ...c,
                                                [String(key)]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                        <label className={local.check}>
                            <input
                                type="checkbox"
                                required
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                disabled={busy}
                            />
                            Revisé la placa, el tipo y los datos del vehículo.
                        </label>
                        <Button
                            type="submit"
                            state={busy || !accepted ? "disabled" : "default"}
                        >
                            Registrar vehículo revisado
                        </Button>
                    </form>
                </section>
            )}
            {vehicle && !register && (
                <form onSubmit={create}>
                    <h3>Datos de colocación</h3>
                    <div className={local.form}>
                        <CctPicker
                            kind="cruceros"
                            label="Crucero"
                            value={form.crucero}
                            onChange={(v) =>
                                setForm((f) => ({ ...f, crucero: v }))
                            }
                            disabled={busy}
                        />
                        <CctPicker
                            kind="motivos"
                            label="Motivo"
                            value={form.motivo}
                            onChange={(v) =>
                                setForm((f) => ({ ...f, motivo: v }))
                            }
                            disabled={busy}
                        />
                        <CctPicker
                            kind="delegaciones"
                            label="Delegación"
                            value={form.delegacion}
                            onChange={(v) =>
                                setForm((f) => ({ ...f, delegacion: v }))
                            }
                            disabled={busy}
                        />
                        <CctPicker
                            kind="agentes"
                            label="Tipo de agente"
                            value={form.tipoAgente}
                            onChange={(v) =>
                                setForm((f) => ({ ...f, tipoAgente: v }))
                            }
                            disabled={busy}
                        />
                        {[
                            ["agente", "Chapa del agente"],
                            ["cepoFisico", "Número de cepo físico"],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <label htmlFor={"cct-new-" + key}>
                                    {label} *
                                </label>
                                <input
                                    id={"cct-new-" + key}
                                    className={styles.control}
                                    required
                                    maxLength={18}
                                    inputMode="numeric"
                                    value={form[key]}
                                    disabled={busy}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            [key]: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        ))}
                        <div>
                            <label htmlFor="cct-colocado-fecha">
                                Fecha y hora de colocación *
                            </label>
                            <input
                                id="cct-colocado-fecha"
                                className={styles.control}
                                type="datetime-local"
                                required
                                value={form.fecha}
                                max={cctCivilNow()}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        fecha: e.target.value,
                                    }))
                                }
                                disabled={busy}
                            />
                        </div>
                        <div>
                            <label htmlFor="cct-new-note">Observaciones</label>
                            <textarea
                                id="cct-new-note"
                                className={styles.control}
                                value={form.observaciones}
                                maxLength={300}
                                disabled={busy}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        observaciones: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <label className={local.check}>
                        <input
                            type="checkbox"
                            checked={accepted}
                            required
                            disabled={busy}
                            onChange={(e) => setAccepted(e.target.checked)}
                        />
                        Revisé el vehículo y los datos de colocación del aviso.
                    </label>
                    <Button
                        type="submit"
                        state={busy || !accepted ? "disabled" : "default"}
                    >
                        {busy ? "Registrando…" : "Registrar aviso revisado"}
                    </Button>
                </form>
            )}
            {error && (
                <p className={styles.error} role="alert">
                    {error} Conservamos los datos para reintentar.
                </p>
            )}
            {message && (
                <p className={local.success} role="status">
                    {message}
                </p>
            )}
        </section>
    );
}
function CepoAction({
    detail,
    action,
    admin,
    onDone,
}: {
    detail: CctCepo;
    action: string;
    admin: boolean;
    onDone: (message: string) => void;
}) {
    const [values, setValuesRaw] = useState<Record<string, string>>({
            origen: "",
            boleta: "",
            tipoAgente: "",
            agente: "",
            fecha: cctCivilNow(),
            observaciones: "",
        }),
        [accepted, setAccepted] = useState(false),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    function setValues(value: React.SetStateAction<Record<string, string>>) {
        setValuesRaw(value);
        setAccepted(false);
    }
    const flight = useRef(false),
        active = useRef(true);
    useEffect(() => {
        active.current = true;
        return () => {
            active.current = false;
        };
    }, []);
    const label =
        action === "PAGO"
            ? "Registrar pago"
            : action === "LIBERAR"
              ? "Registrar liberación"
              : action === "DANIO"
                ? "Registrar daño"
                : "Registrar robo";
    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (flight.current || !accepted) return;
        flight.current = true;
        setBusy(true);
        setError("");
        const data =
            action === "PAGO"
                ? { origen: values.origen, boleta: values.boleta }
                : action === "LIBERAR"
                  ? {
                        tipoAgente: values.tipoAgente,
                        agente: values.agente,
                        fecha: values.fecha,
                        observaciones: values.observaciones,
                    }
                  : { observaciones: values.observaciones };
        try {
            const result = await platformCommand<{
                remision: { serie: string; numero: string } | null;
            }>(
                "/cct/cepos/" + detail.datos.AVISO + "/" + action.toLowerCase(),
                "POST",
                { version: detail.version, data },
                admin,
                label,
            );
            if (active.current)
                onDone(
                    label +
                        ": operación registrada." +
                        (result.remision
                            ? " Remisión generada " +
                              result.remision.serie +
                              "-" +
                              result.remision.numero +
                              "."
                            : ""),
                );
        } catch (e) {
            if (active.current) setError(cctError(e));
        } finally {
            flight.current = false;
            if (active.current) setBusy(false);
        }
    }
    return (
        <section className={local.review} aria-label={label}>
            <h3>{label}</h3>
            {["DANIO", "ROBO"].includes(action) && (
                <p>
                    Se registrará el incidente y una remisión de Q{" "}
                    {detail.tarifas?.[action as "DANIO" | "ROBO"]} conforme a la
                    regla {detail.tarifas?.regla}.
                </p>
            )}
            <form onSubmit={submit}>
                <div className={local.form}>
                    {action === "PAGO" ? (
                        <>
                            <div>
                                <label htmlFor="cct-payment-origin">
                                    Origen de pago *
                                </label>
                                <select
                                    id="cct-payment-origin"
                                    className={styles.control}
                                    required
                                    value={values.origen}
                                    disabled={busy}
                                    onChange={(e) =>
                                        setValues((v) => ({
                                            ...v,
                                            origen: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="">
                                        Selecciona el origen
                                    </option>
                                    {originNames.map((label, i) => (
                                        <option key={i} value={i + 1}>
                                            {i + 1} · {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="cct-payment-receipt">
                                    Número de boleta de pago *
                                </label>
                                <input
                                    id="cct-payment-receipt"
                                    className={styles.control}
                                    required
                                    maxLength={18}
                                    value={values.boleta}
                                    disabled={busy}
                                    inputMode="numeric"
                                    onChange={(e) =>
                                        setValues((v) => ({
                                            ...v,
                                            boleta: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </>
                    ) : action === "LIBERAR" ? (
                        <>
                            <CctPicker
                                kind="agentes"
                                label="Tipo de agente que libera"
                                value={values.tipoAgente}
                                onChange={(v) =>
                                    setValues((p) => ({ ...p, tipoAgente: v }))
                                }
                                disabled={busy}
                            />
                            <div>
                                <label htmlFor="cct-release-agent">
                                    Chapa del agente que libera *
                                </label>
                                <input
                                    id="cct-release-agent"
                                    className={styles.control}
                                    required
                                    maxLength={18}
                                    value={values.agente}
                                    disabled={busy}
                                    onChange={(e) =>
                                        setValues((v) => ({
                                            ...v,
                                            agente: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label htmlFor="cct-release-date">
                                    Fecha y hora de liberación *
                                </label>
                                <input
                                    id="cct-release-date"
                                    className={styles.control}
                                    required
                                    type="datetime-local"
                                    value={values.fecha}
                                    min={detail.datos.FECHA || undefined}
                                    max={cctCivilNow()}
                                    disabled={busy}
                                    onChange={(e) =>
                                        setValues((v) => ({
                                            ...v,
                                            fecha: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </>
                    ) : null}
                    {action !== "PAGO" && (
                        <div>
                            <label htmlFor="cct-action-note">
                                Observaciones{action === "LIBERAR" ? "" : " *"}
                            </label>
                            <textarea
                                id="cct-action-note"
                                className={styles.control}
                                value={values.observaciones}
                                required={action !== "LIBERAR"}
                                maxLength={action === "LIBERAR" ? 300 : 250}
                                disabled={busy}
                                onChange={(e) =>
                                    setValues((v) => ({
                                        ...v,
                                        observaciones: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    )}
                </div>
                <label className={local.check}>
                    <input
                        type="checkbox"
                        required
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        disabled={busy}
                    />
                    Revisé el aviso y los datos de esta operación.
                </label>
                <Button
                    type="submit"
                    state={busy || !accepted ? "disabled" : "default"}
                >
                    {busy ? "Registrando…" : label}
                </Button>
            </form>
            {error && (
                <p className={styles.error} role="alert">
                    {error} Conservamos los datos. Consulta el estado del aviso
                    antes de cambiar la solicitud.
                </p>
            )}
        </section>
    );
}
export function CctCepos({ bootstrap }: { bootstrap: CctBootstrap }) {
    const { data: runtime } = usePlatform(),
        admin = Boolean(runtime?.actor.admin);
    const [mode, setMode] = useState("aviso"),
        [fields, setFields] = useState({
            aviso: "",
            tipoPlaca: "P",
            placa: "",
        }),
        [result, setResult] = useState<CctPage | null>(null),
        [applied, setApplied] = useState<Record<string, string> | null>(null),
        [detail, setDetail] = useState<CctCepo | null>(null),
        [detailId, setDetailId] = useState(""),
        [create, setCreate] = useState(false),
        [action, setAction] = useState(""),
        [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [message, setMessage] = useState("");
    const request = useRef<AbortController | null>(null),
        detailRequest = useRef<AbortController | null>(null);
    useEffect(
        () => () => {
            request.current?.abort();
            detailRequest.current?.abort();
        },
        [],
    );
    function query(): Record<string, string> {
        return mode === "aviso"
            ? { aviso: fields.aviso }
            : { tipoPlaca: fields.tipoPlaca, placa: fields.placa };
    }
    async function search(q: Record<string, string> = query(), offset = 0) {
        request.current?.abort();
        const ctl = new AbortController();
        request.current = ctl;
        setBusy(true);
        setError("");
        try {
            const p = await platformFetch<CctPage>(
                "/cct/cepos?" + cctQuery({ ...q, offset: String(offset) }),
                { signal: ctl.signal },
            );
            if (ctl.signal.aborted) return;
            setResult(p);
            setApplied(q);
            setDetail(null);
            setDetailId("");
            setAction("");
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setBusy(false);
        }
    }
    async function open(id: string) {
        detailRequest.current?.abort();
        const ctl = new AbortController();
        detailRequest.current = ctl;
        setDetailId(id);
        setDetail(null);
        setBusy(true);
        setError("");
        setAction("");
        try {
            const d = await platformFetch<CctCepo>(
                "/cct/cepos/" + encodeURIComponent(id),
                { signal: ctl.signal },
            );
            if (!ctl.signal.aborted) setDetail(d);
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setBusy(false);
        }
    }
    const labels: Record<string, string> = {
        PAGO: "Registrar pago",
        LIBERAR: "Liberar cepo",
        DANIO: "Registrar daño",
        ROBO: "Registrar robo",
    };
    if (create)
        return (
            <CreateCepo
                admin={admin}
                onCancel={() => setCreate(false)}
                onDone={(id) => {
                    setCreate(false);
                    setMessage("Aviso " + id + " registrado.");
                    void open(id);
                }}
            />
        );
    return (
        <>
            <section className={styles.card}>
                <div className={styles.toolbar}>
                    <h2>Consultar cepos</h2>
                    {bootstrap.disponibilidad.crear.habilitado && (
                        <Button
                            onClick={() => {
                                setCreate(true);
                                setMessage("");
                            }}
                        >
                            Registrar nuevo aviso
                        </Button>
                    )}
                </div>
                {!bootstrap.escrituras ||
                !bootstrap.numeracionLista ||
                !bootstrap.operador ? (
                    <p className={local.hint}>
                        {bootstrap.disponibilidad.crear.motivo ||
                            "Consulta disponible; las acciones requieren habilitación de Informática."}
                    </p>
                ) : null}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void search();
                    }}
                >
                    <div className={local.form}>
                        <div>
                            <label htmlFor="cct-cepo-search">Buscar por</label>
                            <select
                                id="cct-cepo-search"
                                className={styles.control}
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                <option value="aviso">Número de aviso</option>
                                <option value="placa">Placa</option>
                            </select>
                        </div>
                        {(mode === "aviso"
                            ? [["aviso", "Número de aviso"]]
                            : [
                                  ["tipoPlaca", "Tipo de placa"],
                                  ["placa", "Placa"],
                              ]
                        ).map(([key, label]) => (
                            <div key={key}>
                                <label htmlFor={"cct-cepo-" + key}>
                                    {label} *
                                </label>
                                <input
                                    id={"cct-cepo-" + key}
                                    className={styles.control}
                                    value={fields[key as keyof typeof fields]}
                                    required
                                    maxLength={key === "tipoPlaca" ? 3 : 20}
                                    onChange={(e) =>
                                        setFields((f) => ({
                                            ...f,
                                            [key]: e.target.value.toUpperCase(),
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    <Button type="submit" state={busy ? "disabled" : "default"}>
                        Consultar cepos
                    </Button>
                </form>
            </section>
            {message && (
                <p className={local.success} role="status">
                    {message}
                </p>
            )}
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                    {detailId && (
                        <Button
                            variant="outlined"
                            onClick={() => void open(detailId)}
                        >
                            Actualizar ficha
                        </Button>
                    )}
                </p>
            )}
            {result && (
                <section className={styles.card}>
                    <CctTable
                        label="Avisos de cepo encontrados"
                        items={result.items}
                        onSelect={(r) => void open(r.AVISO!)}
                    />
                    <CctPager
                        data={result}
                        disabled={busy}
                        onPage={(offset) => void search(applied!, offset)}
                    />
                </section>
            )}
            {detail && (
                <section className={styles.card} aria-label="Ficha de cepo">
                    <div className={styles.toolbar}>
                        <h2>
                            Aviso {detail.datos.AVISO} ·{" "}
                            {CCT_STATES[detail.datos.ESTATUS || ""] ||
                                detail.datos.ESTATUS}
                        </h2>
                        <Button
                            variant="outlined"
                            state={busy ? "disabled" : "default"}
                            onClick={() => void open(detail.datos.AVISO!)}
                        >
                            Actualizar ficha
                        </Button>
                    </div>
                    <CctData row={detail.datos} />
                    <h3>Vehículo</h3>
                    {detail.vehiculo ? (
                        <CctData row={detail.vehiculo} />
                    ) : (
                        <p className={styles.error}>
                            La referencia de vehículo requiere revisión. El
                            aviso conserva su historial.
                        </p>
                    )}
                    <div className={local.buttons}>
                        {Object.entries(labels)
                            .filter(([key]) =>
                                key === "LIBERAR"
                                    ? detail.datos.ESTATUS === "P"
                                    : detail.datos.ESTATUS === "C",
                            )
                            .map(([key, label]) => {
                                const capability =
                                        key === "PAGO"
                                            ? "pago"
                                            : key === "LIBERAR"
                                              ? "liberar"
                                              : "incidencia",
                                    allowed =
                                        bootstrap.disponibilidad[capability];
                                return bootstrap.acciones[capability] ? (
                                    <div key={key}>
                                        {capability === "incidencia" &&
                                        detail.vehiculoPendiente ? (
                                            <p className={local.hint}>
                                                Para generar la multa debe
                                                revisarse primero la referencia
                                                del vehículo.
                                            </p>
                                        ) : allowed.habilitado ? (
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setAction(key);
                                                    setMessage("");
                                                }}
                                            >
                                                {label}
                                            </Button>
                                        ) : (
                                            <p className={local.hint}>
                                                {label}: {allowed.motivo}
                                            </p>
                                        )}
                                    </div>
                                ) : null;
                            })}
                    </div>
                    {action && (
                        <CepoAction
                            key={detail.datos.AVISO + action + detail.version}
                            detail={detail}
                            action={action}
                            admin={admin}
                            onDone={(msg) => {
                                setMessage(msg);
                                setAction("");
                                void open(detail.datos.AVISO!);
                            }}
                        />
                    )}
                </section>
            )}
        </>
    );
}
