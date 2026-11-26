"use client";
import Link from "next/link";
import { WorkspaceNavigation, useWorkspaceTab, type WorkspaceTab } from "./WorkspaceNavigation";
import { InventoryLinkDialog } from "./InventoryLinkDialog";
import { startTransition, useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { RecordDetail } from "@/features/registros/components/ResourceWorkspace/RecordDetail";
import { RecordEditor } from "@/features/registros/components/ResourceWorkspace/RecordEditor";
import { ResourceWorkspace } from "@/features/registros/components/ResourceWorkspace/ResourceWorkspace";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import net from "@/features/infraestructura/components/NetworkPanel/NetworkPanel.module.scss";
import { DeviceInspector, NetworkOverview } from "@/features/infraestructura/components/NetworkPanel";
import {
    CLASS_LABEL,
    classGlyph,
    edgeStyle,
    portsUsed,
} from "@/features/infraestructura/components/NetworkPanel/networkStyle";
import type { PageResult } from "@/platform/types";
type Graph = {
    dispositivos: PlatformRecord[];
    conexiones: PlatformRecord[];
    instalacion: PlatformRecord;
};
export function NetworkWorkspace() {
    const { data } = usePlatform(),
        [site, setSite] = useState<unknown>(""),
        [view, setView] = useState("logica"),
        [graph, setGraph] = useState<Graph | null>(null),
        [selected, setSelected] = useState<PlatformRecord | null>(null),
        [editing, setEditing] = useState<PlatformRecord | null | undefined>(),
        [link, setLink] = useState<Record<string, unknown> | null>(null),
        [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({}),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false),
        [busy, setBusy] = useState(false),
        [revision, setRevision] = useState(0),
        [plan, setPlan] = useState(""),
        [planOptions, setPlanOptions] = useState<{ id: string; nombre: string; mime: string }[]>([]),
        [planId, setPlanId] = useState("");
    const svg = useRef<SVGSVGElement>(null),
        drag = useRef<{ id: string; dx: number; dy: number } | null>(null),
        [zoom, setZoom] = useState(1);
    const [picker, setPicker] = useState(false);
    // Propuesta: ubicaciones como accesos directos, con su cantidad de dispositivos.
    const [sites, setSites] = useState<{ id: string; nombre: string; count: number }[]>([]);
    useEffect(() => {
        const c = new AbortController();
        const list = (type: string) =>
            platformFetch<PageResult<PlatformRecord>>(`/records/${type}?limit=100`, { signal: c.signal })
                .then((r) => r.items)
                .catch(() => []);
        Promise.all([list("instalaciones"), list("dispositivos")]).then(([places, devices]) => {
            if (c.signal.aborted) return;
            const rows = places
                .map((p) => ({
                    id: p.id,
                    nombre: p.nombre,
                    count: devices.filter((d) => d.datos.instalacionId === p.id).length,
                }))
                .filter((p) => p.count > 0)
                .sort((a, b) => b.count - a.count);
            setSites(rows);
            if (rows[0]) setSite((current: unknown) => current || rows[0].id);
        });
        return () => c.abort();
    }, [revision]);
    const tabs: WorkspaceTab[] = [];
    if (data?.definitions.dispositivos?.actions.LEER)
        tabs.push({
            id: "dispositivos",
            label: "Dispositivos",
            description:
                "Vincula un bien de Activos Fijos o registra un dispositivo; completa su ubicación y cantidad de puertos.",
        });
    if (data?.definitions.conexiones?.actions.LEER)
        tabs.push({
            id: "conexiones",
            label: "Conexiones",
            description: "Une dos dispositivos seleccionando un puerto de origen y uno de destino.",
        });
    if (
        data?.definitions.dispositivos?.actions.LEER &&
        data?.definitions.conexiones?.actions.LEER &&
        data?.definitions.instalaciones?.actions.LEER
    )
        tabs.push({
            id: "mapa",
            label: "Mapa de red",
            description:
                "Selecciona una ubicación para visualizar sus dispositivos y conexiones. El mapa utiliza los mismos registros de las otras pestañas.",
        });
    // Propuesta: el mapa es la vista principal de la red.
    const orderedTabs = [...tabs.filter((t) => t.id === "mapa"), ...tabs.filter((t) => t.id !== "mapa")];
    const { current, select } = useWorkspaceTab(orderedTabs);
    useEffect(() => {
        startTransition(() => {
            setGraph(null);
        });
        startTransition(() => {
            setSelected(null);
        });
        startTransition(() => {
            setPositions({});
        });
        startTransition(() => {
            setPlanId("");
        });
        startTransition(() => {
            setPlanOptions([]);
        });
        if (!site) return;
        const controller = new AbortController();
        startTransition(() => {
            setLoading(true);
        });
        startTransition(() => {
            setError("");
        });
        platformFetch<Graph>("/network/" + site, { signal: controller.signal })
            .then(setGraph)
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        platformFetch<{ id: string; nombre: string; mime: string }[]>(
            "/records/instalaciones/" + site + "/files",
            { signal: controller.signal },
        )
            .then(setPlanOptions)
            .catch(() => {});
        return () => controller.abort();
    }, [site, revision]);
    useEffect(() => {
        startTransition(() => {
            setPlan("");
        });
        if (!planId) return;
        let url = "";
        const controller = new AbortController();
        platformFetch<Blob>("/files/" + planId, { signal: controller.signal })
            .then((blob) => {
                if (controller.signal.aborted) return;
                url = URL.createObjectURL(blob);
                setPlan(url);
            })
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            });
        return () => {
            controller.abort();
            if (url) URL.revokeObjectURL(url);
        };
    }, [planId]);
    const physical = view === "fisica",
        coords = (row: PlatformRecord) =>
            positions[row.id] || {
                x: Number(row.datos[physical ? "planoX" : "x"] ?? 120),
                y: Number(row.datos[physical ? "planoY" : "y"] ?? 100),
            };
    // Propuesta: en la topología, el encuadre se ajusta a los dispositivos.
    const fitBox = (() => {
        // Se calcula con las posiciones guardadas: arrastrar no mueve el encuadre.
        const nodes = (graph?.dispositivos || []).map((r) => ({
            x: Number(r.datos.x ?? 120),
            y: Number(r.datos.y ?? 100),
        }));
        if (!nodes.length) return "0 0 1200 700";
        const minX = Math.min(...nodes.map((n) => n.x)) - 40,
            minY = Math.min(...nodes.map((n) => n.y)) - 40,
            maxX = Math.max(...nodes.map((n) => n.x)) + 212,
            maxY = Math.max(...nodes.map((n) => n.y)) + 96;
        return `${minX} ${minY} ${Math.max(480, maxX - minX)} ${Math.max(320, maxY - minY)}`;
    })();
    function point(e: React.PointerEvent<SVGSVGElement>) {
        const matrix = svg.current?.getScreenCTM()?.inverse();
        return matrix ? new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix) : new DOMPoint(0, 0);
    }
    async function save() {
        setBusy(true);
        setError("");
        try {
            const placements = Object.entries(positions).map(([id, p]) => ({
                id,
                version: graph!.dispositivos.find((d) => d.id === id)!.version,
                ...(physical ? { planoX: p.x, planoY: p.y } : p),
            }));
            await platformCommand(
                "/records/dispositivos/layout",
                "POST",
                { placements },
                data!.actor.admin,
                "Guardar ubicación de " + placements.length + " dispositivos",
            );
            setPositions({});
            setRevision((n) => n + 1);
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo guardar la topología.");
        } finally {
            setBusy(false);
        }
    }
    const canEdit = data!.definitions.dispositivos?.actions.EDITAR;
    return (
        <section className={`${styles.page} ${styles.workspace}`}>
            <div className={styles.toolbar}>
                <p className={styles.muted}>Las ubicaciones se comparten con Activos y mantenimiento.</p>
                {data?.definitions.instalaciones?.actions.LEER && (
                    <Link className={styles.shortcut} href="/espacio/inventario?view=ubicaciones">
                        Administrar ubicaciones
                    </Link>
                )}
            </div>
            {
                <NetworkOverview
                    revision={revision}
                    onSelect={(id) => orderedTabs.some((t) => t.id === id) && select(id)}
                />
            }
            <WorkspaceNavigation
                tabs={orderedTabs}
                current={current}
                onSelect={select}
                label="Red y cableado"
            />
            {picker && (
                <InventoryLinkDialog
                    onClose={() => setPicker(false)}
                    onSaved={() => {
                        setPicker(false);
                        setRevision((v) => v + 1);
                    }}
                />
            )}
            {current?.id === "dispositivos" ? (
                <ResourceWorkspace
                    key={"devices-" + revision}
                    group="red"
                    initialType="dispositivos"
                    types={["dispositivos"]}
                    hideTabs
                    hideDescription
                    extraActions={
                        data?.definitions.dispositivos?.actions.INSERTAR && (
                            <Button variant="outlined" onClick={() => setPicker(true)}>
                                Vincular bien de Activos Fijos
                            </Button>
                        )
                    }
                />
            ) : current?.id === "conexiones" ? (
                <ResourceWorkspace
                    group="red"
                    initialType="conexiones"
                    types={["conexiones"]}
                    hideTabs
                    hideDescription
                />
            ) : current?.id === "mapa" ? (
                <>
                    {
                        <div className={net.mapBar}>
                            <div className={net.sites} role="group" aria-label="Ubicaciones con dispositivos">
                                {sites.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        aria-pressed={site === p.id}
                                        onClick={() => {
                                            if (Object.keys(positions).length) {
                                                setError(
                                                    "Guarda o descarta las posiciones antes de cambiar de ubicación.",
                                                );
                                                return;
                                            }
                                            setSite(p.id);
                                        }}
                                    >
                                        {p.nombre} <span>{p.count}</span>
                                    </button>
                                ))}
                                {!sites.length && (
                                    <span className={styles.muted}>
                                        Ninguna ubicación tiene dispositivos todavía.
                                    </span>
                                )}
                            </div>
                            <div className={net.mapActions}>
                                <div className={net.segmented} role="group" aria-label="Vista de red">
                                    {[
                                        ["logica", "Topología"],
                                        ["fisica", "Sobre plano"],
                                    ].map(([id, label]) => (
                                        <button
                                            key={id}
                                            type="button"
                                            aria-pressed={view === id}
                                            onClick={() => {
                                                if (Object.keys(positions).length) {
                                                    setError(
                                                        "Guarda o descarta las posiciones antes de cambiar de vista.",
                                                    );
                                                    return;
                                                }
                                                setView(id);
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {Object.keys(positions).length > 0 ? (
                                    <>
                                        <Button variant="outlined" onClick={() => setPositions({})}>
                                            Descartar posiciones
                                        </Button>
                                        <Button
                                            onClick={() => void save()}
                                            state={busy ? "loading" : "default"}
                                        >
                                            Guardar posiciones
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outlined" onClick={() => setRevision((n) => n + 1)}>
                                            Actualizar
                                        </Button>
                                        {site && data!.definitions.dispositivos?.actions.INSERTAR && (
                                            <Button onClick={() => setEditing(null)}>
                                                Agregar dispositivo
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    }

                    {error && (
                        <p role="alert" className={styles.error}>
                            {error}
                        </p>
                    )}
                    {loading && <p role="status">Cargando conexiones…</p>}
                    {!site && (
                        <p className={styles.card}>
                            Selecciona una ubicación para ver sus dispositivos, puertos y conexiones. Si aún
                            no tiene dispositivos, regístralos en la pestaña Dispositivos.
                        </p>
                    )}
                    {graph && (
                        <>
                            <div className={styles.toolbar} hidden>
                                <p className={styles.muted}>
                                    {graph.dispositivos.length} dispositivos · {graph.conexiones.length}{" "}
                                    conexiones.{" "}
                                    {canEdit
                                        ? "Arrastra un dispositivo o ajusta sus coordenadas con el teclado."
                                        : ""}
                                </p>
                                <div className={styles.actions}>
                                    {data!.definitions.dispositivos?.actions.INSERTAR && (
                                        <Button onClick={() => setEditing(null)}>Agregar dispositivo</Button>
                                    )}
                                    <Button variant="outlined" onClick={() => setRevision((n) => n + 1)}>
                                        Actualizar
                                    </Button>
                                </div>
                            </div>
                            {physical && (
                                <label className={styles.field}>
                                    Plano de la instalación
                                    <select
                                        className={styles.control}
                                        value={planId}
                                        onChange={(e) => setPlanId(e.target.value)}
                                    >
                                        <option value="">Sin imagen de fondo</option>
                                        {planOptions
                                            .filter((p) => p.mime.startsWith("image/"))
                                            .map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre}
                                                </option>
                                            ))}
                                    </select>
                                    <small className={styles.muted}>
                                        Los planos se adjuntan en la ficha de la instalación. Posiciones en un
                                        lienzo de 1 200 × 700.
                                    </small>
                                </label>
                            )}
                            <div className={net.stage}>
                                <div className={net.canvasWrap}>
                                    {
                                        <>
                                            <div className={net.zoom} role="group" aria-label="Zoom del mapa">
                                                <button
                                                    type="button"
                                                    aria-label="Acercar"
                                                    onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label="Alejar"
                                                    onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                                                >
                                                    −
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label="Ajustar"
                                                    onClick={() => setZoom(1)}
                                                >
                                                    ⤢
                                                </button>
                                            </div>
                                            <p className={net.mapStatus}>
                                                {graph.dispositivos.length} dispositivos ·{" "}
                                                {graph.conexiones.length} enlaces
                                                {canEdit ? " · arrastra para reubicar" : ""}
                                            </p>
                                        </>
                                    }
                                    <div className={styles.actions} hidden>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                                        >
                                            Acercar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                                        >
                                            Alejar
                                        </Button>
                                        <Button variant="outlined" onClick={() => setZoom(1)}>
                                            Ajustar
                                        </Button>
                                    </div>
                                    <div className={styles.canvas}>
                                        <svg
                                            ref={svg}
                                            viewBox={!physical ? fitBox : "0 0 1200 700"}
                                            style={{ width: zoom * 100 + "%" }}
                                            role="group"
                                            aria-label={"Red de " + graph.instalacion.nombre}
                                            onPointerMove={(e) => {
                                                if (!drag.current) return;
                                                const p = point(e),
                                                    d = drag.current;
                                                setPositions((old) => ({
                                                    ...old,
                                                    [d.id]: {
                                                        x: Math.round(
                                                            Math.max(0, Math.min(1100, p.x - d.dx)),
                                                        ),
                                                        y: Math.round(Math.max(0, Math.min(640, p.y - d.dy))),
                                                    },
                                                }));
                                            }}
                                            onPointerUp={() => {
                                                drag.current = null;
                                            }}
                                            onPointerCancel={() => {
                                                drag.current = null;
                                            }}
                                        >
                                            {physical && plan && (
                                                <image
                                                    href={plan}
                                                    width={1200}
                                                    height={700}
                                                    preserveAspectRatio="xMidYMid meet"
                                                />
                                            )}
                                            {graph.conexiones.map((edge) => {
                                                const a = graph.dispositivos.find(
                                                        (d) => d.id === edge.datos.origenId,
                                                    ),
                                                    b = graph.dispositivos.find(
                                                        (d) => d.id === edge.datos.destinoId,
                                                    );
                                                if (!a || !b) return null;
                                                const p = coords(a),
                                                    q = coords(b);
                                                const st = edgeStyle(edge);
                                                const ax = p.x + 86,
                                                    ay = p.y + 28,
                                                    bx = q.x + 86,
                                                    by = q.y + 28;
                                                const mx = (ax + bx) / 2,
                                                    my = (ay + by) / 2 - Math.min(40, Math.abs(ax - bx) / 8);
                                                const focus =
                                                    selected &&
                                                    (selected.id === a.id || selected.id === b.id);
                                                return (
                                                    <g key={edge.id} opacity={selected && !focus ? 0.35 : 1}>
                                                        <path
                                                            d={`M${ax} ${ay} Q${mx} ${my} ${bx} ${by}`}
                                                            fill="none"
                                                            stroke={st.color}
                                                            strokeWidth={focus ? 3.5 : 2.5}
                                                            strokeDasharray={st.dash}
                                                            strokeLinecap="round"
                                                        />
                                                        {focus && (
                                                            <g
                                                                transform={`translate(${mx} ${(my + (ay + by) / 2) / 2})`}
                                                            >
                                                                <rect
                                                                    className={net.edgePill}
                                                                    x={-22}
                                                                    y={-10}
                                                                    width={44}
                                                                    height={20}
                                                                    rx={10}
                                                                    stroke={st.color}
                                                                />
                                                                <text
                                                                    className={net.edgeLabel}
                                                                    textAnchor="middle"
                                                                    y={4}
                                                                >
                                                                    {String(edge.datos.puertoOrigen)}↔
                                                                    {String(edge.datos.puertoDestino)}
                                                                </text>
                                                            </g>
                                                        )}
                                                    </g>
                                                );
                                            })}
                                            {graph.dispositivos.map((row) => {
                                                const p = coords(row);
                                                return (
                                                    <g
                                                        key={row.id}
                                                        transform={"translate(" + p.x + " " + p.y + ")"}
                                                        role="button"
                                                        tabIndex={0}
                                                        style={{
                                                            cursor: canEdit ? "grab" : "pointer",
                                                        }}
                                                        onClick={() => setSelected(row)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                e.preventDefault();
                                                                setSelected(row);
                                                            }
                                                            if (
                                                                canEdit &&
                                                                [
                                                                    "ArrowLeft",
                                                                    "ArrowRight",
                                                                    "ArrowUp",
                                                                    "ArrowDown",
                                                                ].includes(e.key)
                                                            ) {
                                                                e.preventDefault();
                                                                setPositions((old) => ({
                                                                    ...old,
                                                                    [row.id]: {
                                                                        x: Math.max(
                                                                            0,
                                                                            Math.min(
                                                                                1100,
                                                                                p.x +
                                                                                    (e.key === "ArrowRight"
                                                                                        ? 10
                                                                                        : e.key ===
                                                                                            "ArrowLeft"
                                                                                          ? -10
                                                                                          : 0),
                                                                            ),
                                                                        ),
                                                                        y: Math.max(
                                                                            0,
                                                                            Math.min(
                                                                                640,
                                                                                p.y +
                                                                                    (e.key === "ArrowDown"
                                                                                        ? 10
                                                                                        : e.key === "ArrowUp"
                                                                                          ? -10
                                                                                          : 0),
                                                                            ),
                                                                        ),
                                                                    },
                                                                }));
                                                            }
                                                        }}
                                                        onPointerDown={(e) => {
                                                            setSelected(row);
                                                            if (!canEdit || busy) return;
                                                            const pt = point(
                                                                e as unknown as React.PointerEvent<SVGSVGElement>,
                                                            );
                                                            drag.current = {
                                                                id: row.id,
                                                                dx: pt.x - p.x,
                                                                dy: pt.y - p.y,
                                                            };
                                                            svg.current?.setPointerCapture(e.pointerId);
                                                        }}
                                                    >
                                                        {/* Nombre accesible: el texto visible; el tipo de equipo como descripción. */}
                                                        <desc>
                                                            {String(row.datos.clase || row.datos.tipo || "")}
                                                        </desc>
                                                        {(() => {
                                                            const clase = String(row.datos.clase || "EQUIPO");
                                                            const total = Number(row.datos.puertos) || 0;
                                                            const used = portsUsed(row, graph.conexiones);
                                                            return (
                                                                <g
                                                                    className={net.node}
                                                                    data-class={clase}
                                                                    data-selected={selected?.id === row.id}
                                                                >
                                                                    <rect
                                                                        className={net.card}
                                                                        width={172}
                                                                        height={56}
                                                                        rx={12}
                                                                    />
                                                                    <rect
                                                                        className={net.tintBox}
                                                                        x={8}
                                                                        y={8}
                                                                        width={34}
                                                                        height={34}
                                                                        rx={9}
                                                                    />
                                                                    <path
                                                                        className={net.tintPath}
                                                                        transform="translate(15 15)"
                                                                        d={classGlyph(clase)}
                                                                        fill="none"
                                                                        strokeWidth={1.6}
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                    <text
                                                                        className={net.nodeName}
                                                                        x={50}
                                                                        y={22}
                                                                    >
                                                                        {row.nombre.length > 20
                                                                            ? row.nombre.slice(0, 19) + "…"
                                                                            : row.nombre}
                                                                    </text>
                                                                    <text
                                                                        className={net.nodeSub}
                                                                        x={50}
                                                                        y={37}
                                                                    >
                                                                        {CLASS_LABEL[clase] || clase} · {used}
                                                                        /{total}
                                                                    </text>
                                                                    <rect
                                                                        className={net.usageTrack}
                                                                        x={50}
                                                                        y={44}
                                                                        width={112}
                                                                        height={4}
                                                                        rx={2}
                                                                    />
                                                                    <rect
                                                                        className={net.usage}
                                                                        x={50}
                                                                        y={44}
                                                                        width={
                                                                            total
                                                                                ? Math.max(
                                                                                      2,
                                                                                      (used / total) * 112,
                                                                                  )
                                                                                : 0
                                                                        }
                                                                        height={4}
                                                                        rx={2}
                                                                    />
                                                                    <title>{`${row.nombre} · ${CLASS_LABEL[clase] || clase} · ${used} de ${total} puertos en uso`}</title>
                                                                </g>
                                                            );
                                                        })()}
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>
                                </div>
                                {
                                    <DeviceInspector
                                        device={selected}
                                        graph={graph}
                                        canEdit={!!canEdit}
                                        canLink={!!data!.definitions.conexiones?.actions.INSERTAR}
                                        onPort={(port, edge) =>
                                            edge
                                                ? setLink({ existing: edge })
                                                : selected &&
                                                  setLink({ origenId: selected.id, puertoOrigen: port })
                                        }
                                        onOpen={() => selected && setLink({ device: selected })}
                                        onEdit={() => selected && setEditing(selected)}
                                    />
                                }
                            </div>
                        </>
                    )}
                </>
            ) : (
                <p className={styles.card}>No tienes registros de red disponibles.</p>
            )}
            {editing !== undefined && (
                <RecordEditor
                    type="dispositivos"
                    record={editing || undefined}
                    initial={{ instalacionId: site }}
                    onClose={() => setEditing(undefined)}
                    onSaved={() => {
                        setEditing(undefined);
                        setRevision((n) => n + 1);
                    }}
                />
            )}
            {link && (link.existing || link.device) ? (
                <RecordDetail
                    type={link.existing ? "conexiones" : "dispositivos"}
                    record={(link.existing || link.device) as PlatformRecord}
                    onClose={() => setLink(null)}
                    onEdit={(row) => {
                        setLink(null);
                        if (row.datos.origenId) setLink({ edit: row });
                        else setEditing(row);
                    }}
                    onChanged={() => setRevision((n) => n + 1)}
                />
            ) : link ? (
                <RecordEditor
                    type="conexiones"
                    record={link.edit as PlatformRecord | undefined}
                    initial={link}
                    onClose={() => setLink(null)}
                    onSaved={() => {
                        setLink(null);
                        setRevision((n) => n + 1);
                    }}
                />
            ) : null}
        </section>
    );
}
