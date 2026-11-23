"use client";
import { useState } from "react";
import { FormField } from "@/components/client/molecules/FormField";
import { Button } from "@/components/client/atoms/Button";
import { Select } from "@/components/client/atoms/Select";
import { useGetFuncionesPorUsuarioEmpresas, useGetFuncionesPorUsuarioUsuarios, useGetFuncionesPorUsuarioAplicaciones, useGetFuncionesPorUsuarioPermisos } from "@/api/hooks";
import { graphqlRequestClient } from "@/api/graphql/client";
import { GUARDAR_FUNCIONES_MUTATION, COPIAR_FUNCIONES_MUTATION } from "@/api/graphql/MOD06/mutations";
import { ErrorHandler } from "@/api/graphql/errors";
import styles from "./MOD06.module.scss";

import { useModuleActions } from "@/components/client/organisms/ModuleAccessGate/ModuleAccessGate";
import { AccessChoices } from "@/components/client/molecules/AccessChoices/AccessChoices";

export default function MOD06() {
    const canEdit = useModuleActions().EDITAR;
    const companies = useGetFuncionesPorUsuarioEmpresas(), users = useGetFuncionesPorUsuarioUsuarios(), apps = useGetFuncionesPorUsuarioAplicaciones();
    const permissions = useGetFuncionesPorUsuarioPermisos();
    const [company, setCompany] = useState("97"), [user, setUser] = useState(""), [app, setApp] = useState("");
    const [origin, setOrigin] = useState(""), [destination, setDestination] = useState("");
    const [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false);
    const [selected, setSelected] = useState<number[]>([]), [loaded, setLoaded] = useState("");
    const [error, setError] = useState(""), [success, setSuccess] = useState("");
    const catalogError = companies.error || users.error || apps.error;
    const catalogErrors = [['Empresas', companies.error], ['Usuarios', users.error], ['Aplicaciones', apps.error]] as const;
    const input = { empresa: company, asignaUsuario: user, aplicacion: app };
    const key = JSON.stringify(input);
    const loading = companies.loading || users.loading || apps.loading;
    async function consult() {
        if (!company || !user || !app) { setError("Selecciona empresa, usuario y aplicación."); return; }
        setError(""); setSuccess(""); setLoaded("");
        try {
            const result = await permissions.fetchPermisos(input);
            setSelected(result?.funciones.filter(f => f.permitido).map(f => f.funcion) || []);
            setLoaded(key);
        } catch (e) { setError(ErrorHandler.getUserMessage(e)); }
    }
    async function write(copy: boolean) {
        if (!canEdit || busy) return;
        setError(""); setSuccess("");
        if (copy && (!origin || !destination || origin === destination || !confirmed)) { setError("Selecciona usuarios distintos y confirma el alcance de la copia."); return; }
        if (!copy && loaded !== key) { setError("Consulta los permisos antes de guardar."); return; }
        setBusy(true);
        try {
            const data = await graphqlRequestClient<Record<string, { success: boolean; message: string }>>(copy ? COPIAR_FUNCIONES_MUTATION : GUARDAR_FUNCIONES_MUTATION, { variables: { input: copy ? { usuarioOrigen: origin, usuarioDestino: destination, confirmar: true } : { ...input, funciones: selected } } });
            const result = data[copy ? "copiarFuncionesPorUsuario" : "guardarFuncionesPorUsuario"];
            if (!result?.success) throw Error("No se confirmó la operación.");
            setSuccess(result.message); setLoaded(""); setConfirmed(false);
        } catch (e) { setError(ErrorHandler.getUserMessage(e)); }
        finally { setBusy(false); }
    }
    const userOptions = users.data.map(item => ({ label: item.usuario, value: item.asignaUsuario }));
    return <div className={styles.mainContainer}>
        <section className={styles.formContainer} aria-label="Permisos corporativos por aplicación">
            <h2 className={styles.title}>Información general</h2>
            <p>Consulta y actualiza las funciones de un usuario en una aplicación.</p>
            {!canEdit && <p role="status">Tienes acceso de consulta. Para guardar o copiar funciones necesitas permiso de edición.</p>}
            {catalogError && <div role="alert"><p>No se pudieron cargar los catálogos.</p><ul>{catalogErrors.filter(([,value]) => value).map(([label,value]) => { const detail = value as Error & { body?: { referencia?: string }; statusCode?: number }; return <li key={label}>{label}: {detail.message}{detail.body?.referencia && <p>Referencia: {detail.body.referencia}</p>}</li>; })}</ul><Button variant="outlined" onClick={() => void Promise.all([companies.refetch(), users.refetch(), apps.refetch()])}>Reintentar catálogos</Button></div>}
            {loading && <p role="status">Cargando catálogos…</p>}
            {error && <p role="alert">{error}</p>}{success && <p role="status">{success}</p>}
            <fieldset disabled={loading || busy || permissions.isLoading || !!catalogError} className={styles.generalInfomationContainer}>
                <FormField label="Empresa" htmlFor="company" required><Select id="company" value={company} onChange={e => setCompany(e.target.value)} options={companies.data.map(item => ({ label: item.nombre, value: item.empresa }))} placeholder="Seleccionar empresa" /></FormField>
                <FormField label="Usuario" htmlFor="generalUser" required><Select id="generalUser" value={user} onChange={e => setUser(e.target.value)} options={userOptions} placeholder="Seleccionar usuario" /></FormField>
                <FormField label="Aplicación" htmlFor="application" required><Select id="application" value={app} onChange={e => setApp(e.target.value)} options={apps.data.map(item => ({ label: item.nombre, value: item.aplicacion }))} placeholder="Seleccionar aplicación" /></FormField>
                <Button type="button" variant="outlined" onClick={() => void consult()}>{permissions.isLoading ? "Consultando…" : "Consultar permisos"}</Button>
            </fieldset>
            {loaded === key && permissions.data && <section className={styles.permissionList} aria-label="Funciones de la aplicación">
                <h3>Funciones autorizadas</h3>
                <AccessChoices label="Funciones de la aplicación" options={permissions.data.funciones.map(item => ({id:item.funcion,nombre:item.nombre}))} value={selected} onChange={setSelected} disabled={busy} readOnly={!canEdit} />
                {!permissions.data.funciones.length && <p>Esta aplicación no tiene funciones registradas.</p>}
                {canEdit && <><p>Guardar reemplaza la selección de funciones de este usuario en la empresa y aplicación elegidas.</p>
                    <Button onClick={() => void write(false)} state={busy ? "loading" : "default"}>Guardar permisos</Button></>}
            </section>}
            {canEdit && <><h2 className={styles.title}>Copiar permisos entre usuarios</h2>
                <p>La copia agrega al destino los permisos del origen en todas sus empresas y aplicaciones.</p>
                <fieldset disabled={loading || busy || !!catalogError} className={styles.userPermissionsContainer}>
                    <FormField label="Usuario Origen" htmlFor="userOrigin" required><Select id="userOrigin" value={origin} onChange={e => { setOrigin(e.target.value); setConfirmed(false); }} options={userOptions} placeholder="Seleccionar usuario origen" /></FormField>
                    <FormField label="Usuario Destino" htmlFor="userDestiny" required><Select id="userDestiny" value={destination} onChange={e => { setDestination(e.target.value); setConfirmed(false); }} options={userOptions} placeholder="Seleccionar usuario destino" /></FormField>
                </fieldset>
                <label className={styles.consent}><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Confirmo copiar los permisos del origen en todas sus aplicaciones al usuario destino.</label>
                <Button onClick={() => void write(true)} state={busy ? "loading" : !confirmed ? "disabled" : "default"}>Copiar permisos</Button></>}
        </section>
    </div>;
}
