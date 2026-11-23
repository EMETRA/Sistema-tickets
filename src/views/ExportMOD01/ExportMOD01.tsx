"use client";
import { useState } from "react";
import { Input } from "@/components/client/atoms/Input";
import { FormField } from "@/components/client/molecules/FormField";
import { Button } from "@/components/client/atoms/Button";
import { useGetReportesSemanales } from "@/api/hooks/useGetReportesSemanales";
import { useGetReporteSemanalExcel } from "@/api/hooks/useGetReporteSemanalExcel";
import type { ReporteSemanalFilterInput } from "@/api/graphql/MOD01";
import { downloadBase64File } from "@/helpers/downloadBase64File";
import styles from "./ExportMOD01.module.scss";

export default function ExportMOD01() {
    const [from, setFrom] = useState(""), [to, setTo] = useState("");
    const [filters, setFilters] = useState<ReporteSemanalFilterInput>({ limit: 100 });
    const [validation, setValidation] = useState("");
    const reports = useGetReportesSemanales(filters), excel = useGetReporteSemanalExcel();
    async function download(id: string) {
        if (excel.loading) return;
        const result = await excel.exportar(id);
        if (result) {
            try { downloadBase64File(result.contentBase64, result.filename, result.mimeType); }
            catch { setValidation("No se pudo descargar el archivo. Reintenta la descarga."); }
        }
    }
    return <div className={styles.mainContainer}><section className={styles.card}>
        <form className={styles.formSection} onSubmit={event => {
            event.preventDefault(); setValidation("");
            if (Boolean(from) !== Boolean(to) || (from && to && from > to)) { setValidation("Ingresa ambas fechas en orden para filtrar el reporte."); return; }
            setFilters({ limit: 100, ...(from && to ? { fechaDesde: from, fechaHasta: to } : {}) });
        }}>
            <h2>Exportar reportes semanales</h2><p>Selecciona un rango y descarga el Excel del reporte que necesitas. Se muestran hasta 100 reportes.</p>
            <div className={styles.fieldsGridTwo}>
                <FormField label="Fecha inicio" htmlFor="fecha-inicio"><Input id="fecha-inicio" type="date" value={from} onChange={e => setFrom(e.target.value)} /></FormField>
                <FormField label="Fecha fin" htmlFor="fecha-fin"><Input id="fecha-fin" type="date" value={to} onChange={e => setTo(e.target.value)} /></FormField>
            </div>
            <div><Button type="submit" state={reports.loading ? "loading" : "default"}>Consultar reportes</Button></div>
        </form>
        {validation && <p role="alert">{validation}</p>}
        {(reports.error || excel.error) && <p role="alert">No se pudo consultar o descargar el reporte. <button onClick={() => void reports.refetch()}>Reintentar consulta</button></p>}
        {reports.loading ? <p role="status">Consultando reportes…</p> : <div className={styles.tableRegion}><table><thead><tr><th>Reporte</th><th>Colaborador</th><th>Proyecto</th><th>Periodo</th><th>Archivo</th></tr></thead><tbody>{reports.data.map(row => <tr key={row.id}><td>#{row.id}</td><td>{row.nombreColaborador || "#" + row.idColaborador}</td><td>{row.proyecto}</td><td>{row.fechaInicio} — {row.fechaFin}</td><td><Button type="button" variant="text" aria-label={"Descargar Excel del reporte " + row.id} onClick={() => void download(row.id)} state={excel.loading ? "disabled" : "default"}>Descargar Excel</Button></td></tr>)}</tbody></table>{!reports.data.length && <p>No hay reportes para los filtros seleccionados.</p>}</div>}
    </section></div>;
}
