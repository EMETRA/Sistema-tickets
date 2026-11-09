"use client";
import { useState, type FormEvent } from "react";
import { FormField } from "@/components/client/molecules/FormField";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import { Select } from "@/components/client/atoms/Select";
import { useConsultaVehiculoMuni } from "@/api/hooks";
import { ErrorHandler } from "@/api/graphql/errors";
import type { TipoUsoVehiculo, VehiculoMuni } from "@/api/graphql/apps/types";
import { USO_VEHICULO_OPTIONS } from "./types";
import styles from "./ConsultaVehiculos.module.scss";

const vehicle = [{ key: "marca", label: "Marca" }, { key: "color", label: "Color" }, { key: "modelo", label: "Modelo" }] as const;
const owner = [{ key: "nombrePropietario", label: "Nombre" }, { key: "nitPropietario", label: "NIT" }, { key: "direccion", label: "Dirección" }, { key: "correo", label: "Correo" }, { key: "telefono", label: "Teléfono" }] as const;

export default function ConsultaVehiculos() {
    const { consultarVehiculo, loading, error } = useConsultaVehiculoMuni();
    const [uso, setUso] = useState("");
    const [placa, setPlaca] = useState("");
    const [validation, setValidation] = useState("");
    const [result, setResult] = useState<VehiculoMuni | null>(null);
    const [consulted, setConsulted] = useState("");
    const [searched, setSearched] = useState(false);
    async function submit(event: FormEvent) {
        event.preventDefault();
        if (loading) return;
        const normalized = placa.trim().toUpperCase();
        if (!uso || !/^[A-Z0-9]{2,10}$/.test(normalized)) {
            setValidation("Selecciona el uso e ingresa una placa válida, de 2 a 10 letras o números sin prefijo.");
            return;
        }
        setValidation(""); setResult(null); setSearched(true); setPlaca(normalized);
        setConsulted(uso + " · " + normalized);
        try { setResult(await consultarVehiculo({ uso: uso as TipoUsoVehiculo, placa: normalized })); }
        catch { /* El error se presenta sin borrar los parámetros. */ }
    }
    function clear() { setUso(""); setPlaca(""); setResult(null); setSearched(false); setConsulted(""); setValidation(""); }
    const fields = (items: ReadonlyArray<{ key: keyof VehiculoMuni; label: string }>) => <dl className={styles.fields}>{items.map(field => <div key={field.key}><dt>{field.label}</dt><dd>{result?.[field.key]?.trim() || "No disponible"}</dd></div>)}</dl>;
    const hasData = result && Object.values(result).some(value => typeof value === "string" && value.trim());
    return <form className={styles.layout} onSubmit={submit} noValidate>
        <section className={styles.card} aria-label="Consulta de vehículos">
            <header><h2>Datos del vehículo</h2><p>Consulta la información por uso y placa.</p></header>
            <div className={styles.inputs}>
                <FormField label="Uso" htmlFor="sat-uso" required><Select id="sat-uso" value={uso} options={USO_VEHICULO_OPTIONS} onChange={event => setUso(event.target.value)} placeholder="Seleccionar uso" disabled={loading} /></FormField>
                <FormField label="Placa" htmlFor="sat-placa" required><Input id="sat-placa" value={placa} onChange={event => setPlaca(event.target.value.toUpperCase())} maxLength={10} placeholder="Ej. 000QA1" disabled={loading} /></FormField>
            </div>
            {validation && <p role="alert" className={styles.error}>{validation}</p>}
            {searched && error && <p role="alert" className={styles.error}>{ErrorHandler.getUserMessage(error)} Los parámetros se conservaron para reintentar.</p>}
            <section className={styles.result} aria-label="Resultado de la consulta" aria-live="polite" aria-busy={loading}>
                <h3>{result ? "Resultado de la consulta" : "Información del vehículo"}</h3>
                {loading ? <p role="status">Consultando SAT…</p> : hasData ? <>
                    <p className={styles.reference}>{consulted}</p>
                    {fields(vehicle)}
                    <h3>Datos del propietario</h3>
                    {fields(owner)}
                </> : <p>{searched && !error ? "SAT no devolvió datos para la placa consultada." : "Los datos aparecerán aquí después de consultar."}</p>}
            </section>
        </section>
        <aside className={styles.summary} aria-label="Resumen de la consulta">
            <h2>Resumen</h2><p>Revisa los datos antes de consultar.</p>
            <dl><div><dt>Uso</dt><dd>{USO_VEHICULO_OPTIONS.find(option => option.value === uso)?.label || "Sin seleccionar"}</dd></div><div><dt>Placa</dt><dd>{placa || "Sin ingresar"}</dd></div></dl>
            <div className={styles.actions}><Button type="button" variant="outlined" onClick={clear} state={loading ? "disabled" : "default"}>Limpiar</Button><Button type="submit" state={loading ? "loading" : "default"} loadingText="Consultando…">{searched && error ? "Reintentar consulta" : "Consultar"}</Button></div>
        </aside>
    </form>;
}
