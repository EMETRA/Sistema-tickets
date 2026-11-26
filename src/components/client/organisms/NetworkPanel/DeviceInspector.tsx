"use client";
import { Button } from "@/components/client/atoms/Button";
import type { PlatformRecord } from "@/platform/types";
import { daysFromToday, relativeDays } from "../AssetsPanel/assetDates";
import { CLASS_LABEL, MEDIUM, classGlyph, edgeStyle, portsUsed } from "./networkStyle";
import styles from "./NetworkPanel.module.scss";

type Graph = { dispositivos: PlatformRecord[]; conexiones: PlatformRecord[] };

/** Propuesta: ficha lateral del dispositivo con ocupación, puertos y enlaces legibles. */
export function DeviceInspector({
    device,
    graph,
    canEdit,
    canLink,
    onPort,
    onOpen,
    onEdit,
}: {
    device: PlatformRecord | null;
    graph: Graph;
    canEdit: boolean;
    canLink: boolean;
    onPort: (port: number, edge?: PlatformRecord) => void;
    onOpen: () => void;
    onEdit: () => void;
}) {
    if (!device)
        return (
            <aside className={styles.inspector}>
                <p className={styles.hint}>
                    Selecciona un dispositivo en el mapa para ver sus puertos, enlaces y última revisión.
                </p>
                <ul className={styles.legend} aria-label="Leyenda de enlaces">
                    {Object.values(MEDIUM).map((m) => (
                        <li key={m.label}>
                            <svg width="28" height="8" aria-hidden="true">
                                <line x1="0" y1="4" x2="28" y2="4" stroke={m.color} strokeWidth="3" strokeDasharray={m.dash} strokeLinecap="round" />
                            </svg>
                            {m.label}
                        </li>
                    ))}
                    <li>
                        <svg width="28" height="8" aria-hidden="true">
                            <line x1="0" y1="4" x2="28" y2="4" stroke="#a3aab8" strokeWidth="3" strokeDasharray="6 5" />
                        </svg>
                        Inactivo
                    </li>
                </ul>
            </aside>
        );
    const clase = String(device.datos.clase || "EQUIPO");
    const total = Math.min(192, Number(device.datos.puertos) || 0);
    const used = portsUsed(device, graph.conexiones);
    const pct = total ? Math.round((used / total) * 100) : 0;
    const links = graph.conexiones
        .filter((e) => e.datos.origenId === device.id || e.datos.destinoId === device.id)
        .map((e) => {
            const mine = e.datos.origenId === device.id;
            const other = graph.dispositivos.find((d) => d.id === (mine ? e.datos.destinoId : e.datos.origenId));
            return { e, port: Number(mine ? e.datos.puertoOrigen : e.datos.puertoDestino), otherPort: Number(mine ? e.datos.puertoDestino : e.datos.puertoOrigen), other };
        })
        .sort((a, b) => a.port - b.port);
    const revision = daysFromToday(device.datos.ultimaRevision);
    return (
        <aside className={styles.inspector} aria-label={"Dispositivo " + device.nombre}>
            <header className={styles.inspectorHead}>
                <span className={styles.glyph} data-class={clase} aria-hidden="true">
                    <svg viewBox="0 0 20 20" width="20" height="20">
                        <path d={classGlyph(clase)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <div>
                    <h3>{device.nombre}</h3>
                    <p>
                        {CLASS_LABEL[clase] || clase} · Inventario {String(device.datos.numeroInventario || "—")}
                        {device.datos.direccion ? ` · ${String(device.datos.direccion)}` : ""}
                    </p>
                </div>
            </header>
            <dl className={styles.facts}>
                <div>
                    <dt>Puertos en uso</dt>
                    <dd>
                        {used} de {total}
                    </dd>
                </div>
                <div data-stale={revision === null || revision < -180 || undefined}>
                    <dt>Última revisión</dt>
                    <dd>{revision === null ? "Sin registro" : relativeDays(revision)}</dd>
                </div>
            </dl>
            <div className={styles.meter} aria-hidden="true">
                <span style={{ width: pct + "%" }} data-level={pct > 85 ? "high" : pct > 65 ? "mid" : "low"} />
            </div>
            {total > 0 && (
                <>
                    <h4 className={styles.subhead}>
                        Puertos <small>Toca uno libre para crear un enlace</small>
                    </h4>
                    <div className={styles.ports}>
                        {Array.from({ length: total }, (_, i) => {
                            const port = i + 1;
                            const link = links.find((l) => l.port === port);
                            return (
                                <button
                                    key={port}
                                    type="button"
                                    data-state={link ? (link.e.estado === "INACTIVO" ? "inactive" : "used") : "free"}
                                    style={link ? ({ "--medium": edgeStyle(link.e).color } as React.CSSProperties) : undefined}
                                    title={link ? `Puerto ${port} → ${link.other?.nombre || "otra ubicación"} · puerto ${link.otherPort}` : `Puerto ${port} libre`}
                                    disabled={!link && !canLink}
                                    onClick={() => onPort(port, link?.e)}
                                >
                                    {port}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
            <h4 className={styles.subhead}>Enlaces ({links.length})</h4>
            <ul className={styles.links}>
                {links.map(({ e, port, other, otherPort }) => {
                    const st = edgeStyle(e);
                    return (
                        <li key={e.id}>
                            <button type="button" onClick={() => onPort(port, e)}>
                                <span className={styles.portBadge}>{port}</span>
                                <svg width="22" height="8" aria-hidden="true">
                                    <line x1="0" y1="4" x2="22" y2="4" stroke={st.color} strokeWidth="3" strokeDasharray={st.dash} strokeLinecap="round" />
                                </svg>
                                <span className={styles.linkText}>
                                    {other?.nombre || "Otra ubicación"}
                                    <small>
                                        puerto {otherPort} · {MEDIUM[String(e.datos.medio)]?.label || "Otro"}
                                        {e.estado === "INACTIVO" ? " · inactivo" : ""}
                                    </small>
                                </span>
                            </button>
                        </li>
                    );
                })}
                {!links.length && <li className={styles.hint}>Sin enlaces registrados.</li>}
            </ul>
            <div className={styles.inspectorActions}>
                <Button variant="outlined" onClick={onOpen}>
                    Ver ficha
                </Button>
                {canEdit && <Button onClick={onEdit}>Editar</Button>}
            </div>
        </aside>
    );
}
export default DeviceInspector;
