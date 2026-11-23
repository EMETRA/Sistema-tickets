"use client";
import Link from "next/link";
import {WorkspaceNavigation,useWorkspaceTab,type WorkspaceTab} from "./WorkspaceNavigation";
import {InventoryLinkDialog} from "./InventoryLinkDialog";
import { startTransition, useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { RecordDetail } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import { RecordEditor } from "@/components/client/organisms/ResourceWorkspace/RecordEditor";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
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
        [positions, setPositions] = useState<
            Record<string, { x: number; y: number }>
        >({}),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false),
        [busy, setBusy] = useState(false),
        [revision, setRevision] = useState(0),
        [plan, setPlan] = useState(""),
        [planOptions, setPlanOptions] = useState<
            { id: string; nombre: string; mime: string }[]
        >([]),
        [planId, setPlanId] = useState("");
    const svg = useRef<SVGSVGElement>(null),
        drag = useRef<{ id: string; dx: number; dy: number } | null>(null),
        [zoom, setZoom] = useState(1);
    const [picker,setPicker]=useState(false);
    const tabs:WorkspaceTab[]=[];
    if(data?.definitions.dispositivos?.actions.LEER)tabs.push({id:'dispositivos',label:'Dispositivos',description:'Vincula un bien de Activos Fijos o registra un dispositivo; completa su ubicación y cantidad de puertos.'});
    if(data?.definitions.conexiones?.actions.LEER)tabs.push({id:'conexiones',label:'Conexiones',description:'Une dos dispositivos seleccionando un puerto de origen y uno de destino.'});
    if(data?.definitions.dispositivos?.actions.LEER && data?.definitions.conexiones?.actions.LEER && data?.definitions.instalaciones?.actions.LEER)tabs.push({id:'mapa',label:'Mapa de red',description:'Selecciona una ubicación para visualizar sus dispositivos y conexiones. El mapa utiliza los mismos registros de las otras pestañas.'});
    const {current,select}=useWorkspaceTab(tabs);
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
    function point(e: React.PointerEvent<SVGSVGElement>) {
        const matrix = svg.current?.getScreenCTM()?.inverse();
        return matrix
            ? new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix)
            : new DOMPoint(0, 0);
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
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo guardar la topología.",
            );
        } finally {
            setBusy(false);
        }
    }
    const canEdit = data!.definitions.dispositivos?.actions.EDITAR;
    return (
        <section className={`${styles.page} ${styles.workspace}`}>
            <div className={styles.toolbar}><p className={styles.muted}>Las ubicaciones se comparten con Activos y mantenimiento.</p>{data?.definitions.instalaciones?.actions.LEER && <Link className={styles.shortcut} href="/espacio/inventario?view=ubicaciones">Administrar ubicaciones</Link>}</div>
            <WorkspaceNavigation tabs={tabs} current={current} onSelect={select} label="Red y cableado"/>
            {picker && <InventoryLinkDialog onClose={()=>setPicker(false)} onSaved={()=>{setPicker(false);setRevision(v=>v+1);}}/>}
            {current?.id === 'dispositivos' ? <ResourceWorkspace key={'devices-'+revision} group="red" initialType="dispositivos" types={['dispositivos']} hideTabs hideDescription extraActions={data?.definitions.dispositivos?.actions.INSERTAR && <Button variant="outlined" onClick={()=>setPicker(true)}>Vincular bien de Activos Fijos</Button>}/>
                : current?.id === 'conexiones' ? <ResourceWorkspace group="red" initialType="conexiones" types={['conexiones']} hideTabs hideDescription/> : current?.id === 'mapa' ? (
                <>
                    <div className={styles.toolbar}>
                        <div className={styles.search}>
                            <PlatformField
                                field={{
                                    key: "instalacionId",
                                    label: "Ubicación / nivel",
                                    type: "ref",
                                    resource: "instalaciones",
                                }}
                                value={site}
                                onChange={setSite}
                            />
                        </div>
                        <div className={styles.actions}>
                            <select
                                aria-label="Vista de red"
                                className={styles.control}
                                value={view}
                                onChange={(e) => {
                                    if (Object.keys(positions).length) {
                                        setError(
                                            "Guarda o descarta las posiciones antes de cambiar de vista.",
                                        );
                                        return;
                                    }
                                    setView(e.target.value);
                                }}
                            >
                                <option value="logica">Topología lógica</option>
                                <option value="fisica">
                                    Ubicación sobre plano
                                </option>
                            </select>
                            {Object.keys(positions).length > 0 && (
                                <>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setPositions({})}
                                    >
                                        Descartar posiciones
                                    </Button>
                                    <Button
                                        onClick={() => void save()}
                                        state={busy ? "loading" : "default"}
                                    >
                                        Guardar posiciones
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    {error && (
                        <p role="alert" className={styles.error}>
                            {error}
                        </p>
                    )}
                    {loading && <p role="status">Cargando conexiones…</p>}
                    {!site && (
                        <p className={styles.card}>
                            Selecciona una ubicación para ver sus dispositivos, puertos y conexiones. Si aún no tiene dispositivos, regístralos en la pestaña Dispositivos.
                        </p>
                    )}
                    {graph && (
                        <>
                            <div className={styles.toolbar}>
                                <p className={styles.muted}>
                                    {graph.dispositivos.length} dispositivos ·{" "}
                                    {graph.conexiones.length} conexiones.{" "}
                                    {canEdit
                                        ? "Arrastra un dispositivo o ajusta sus coordenadas con el teclado."
                                        : ""}
                                </p>
                                <div className={styles.actions}>
                                    {data!.definitions.dispositivos?.actions
                                        .INSERTAR && (
                                        <Button
                                            onClick={() => setEditing(null)}
                                        >
                                            Agregar dispositivo
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            setRevision((n) => n + 1)
                                        }
                                    >
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
                                        onChange={(e) =>
                                            setPlanId(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Sin imagen de fondo
                                        </option>
                                        {planOptions
                                            .filter((p) =>
                                                p.mime.startsWith("image/"),
                                            )
                                            .map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre}
                                                </option>
                                            ))}
                                    </select>
                                    <small className={styles.muted}>
                                        Los planos se adjuntan en la ficha de la
                                        instalación. Posiciones en un lienzo de
                                        1 200 × 700.
                                    </small>
                                </label>
                            )}
                            <div className={styles.split}>
                                <div>
                                    <div className={styles.actions}>
                                        <Button
                                            variant="outlined"
                                            onClick={() =>
                                                setZoom((z) =>
                                                    Math.min(2, z + 0.25),
                                                )
                                            }
                                        >
                                            Acercar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() =>
                                                setZoom((z) =>
                                                    Math.max(0.75, z - 0.25),
                                                )
                                            }
                                        >
                                            Alejar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setZoom(1)}
                                        >
                                            Ajustar
                                        </Button>
                                    </div>
                                    <div className={styles.canvas}>
                                        <svg
                                            ref={svg}
                                            viewBox="0 0 1200 700"
                                            style={{ width: zoom * 100 + "%" }}
                                            role="img"
                                            aria-label={
                                                "Red de " +
                                                graph.instalacion.nombre
                                            }
                                            onPointerMove={(e) => {
                                                if (!drag.current) return;
                                                const p = point(e),
                                                    d = drag.current;
                                                setPositions((old) => ({
                                                    ...old,
                                                    [d.id]: {
                                                        x: Math.round(
                                                            Math.max(
                                                                0,
                                                                Math.min(
                                                                    1100,
                                                                    p.x - d.dx,
                                                                ),
                                                            ),
                                                        ),
                                                        y: Math.round(
                                                            Math.max(
                                                                0,
                                                                Math.min(
                                                                    640,
                                                                    p.y - d.dy,
                                                                ),
                                                            ),
                                                        ),
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
                                                const a =
                                                        graph.dispositivos.find(
                                                            (d) =>
                                                                d.id ===
                                                                edge.datos
                                                                    .origenId,
                                                        ),
                                                    b = graph.dispositivos.find(
                                                        (d) =>
                                                            d.id ===
                                                            edge.datos
                                                                .destinoId,
                                                    );
                                                if (!a || !b) return null;
                                                const p = coords(a),
                                                    q = coords(b);
                                                return (
                                                    <g key={edge.id}>
                                                        <line
                                                            x1={p.x + 45}
                                                            y1={p.y + 20}
                                                            x2={q.x + 45}
                                                            y2={q.y + 20}
                                                            stroke={
                                                                edge.estado ===
                                                                "INACTIVO"
                                                                    ? "#a3aab8"
                                                                    : "#5d78c5"
                                                            }
                                                            strokeWidth={3}
                                                        />
                                                        <text
                                                            x={
                                                                (p.x + q.x) /
                                                                    2 +
                                                                45
                                                            }
                                                            y={
                                                                (p.y + q.y) /
                                                                    2 +
                                                                10
                                                            }
                                                            fontSize={11}
                                                            fill="#18315c"
                                                        >
                                                            {String(
                                                                edge.datos
                                                                    .puertoOrigen,
                                                            )}{" "}
                                                            ↔{" "}
                                                            {String(
                                                                edge.datos
                                                                    .puertoDestino,
                                                            )}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                            {graph.dispositivos.map((row) => {
                                                const p = coords(row);
                                                return (
                                                    <g
                                                        key={row.id}
                                                        transform={
                                                            "translate(" +
                                                            p.x +
                                                            " " +
                                                            p.y +
                                                            ")"
                                                        }
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={
                                                            row.nombre +
                                                            " " +
                                                            String(
                                                                row.datos.tipo,
                                                            )
                                                        }
                                                        style={{
                                                            cursor: canEdit
                                                                ? "grab"
                                                                : "pointer",
                                                        }}
                                                        onClick={() =>
                                                            setSelected(row)
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            )
                                                                setSelected(
                                                                    row,
                                                                );
                                                            if (
                                                                canEdit &&
                                                                [
                                                                    "ArrowLeft",
                                                                    "ArrowRight",
                                                                    "ArrowUp",
                                                                    "ArrowDown",
                                                                ].includes(
                                                                    e.key,
                                                                )
                                                            ) {
                                                                e.preventDefault();
                                                                setPositions(
                                                                    (old) => ({
                                                                        ...old,
                                                                        [row.id]:
                                                                            {
                                                                                x: Math.max(
                                                                                    0,
                                                                                    Math.min(
                                                                                        1100,
                                                                                        p.x +
                                                                                            (e.key ===
                                                                                            "ArrowRight"
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
                                                                                            (e.key ===
                                                                                            "ArrowDown"
                                                                                                ? 10
                                                                                                : e.key ===
                                                                                                    "ArrowUp"
                                                                                                  ? -10
                                                                                                  : 0),
                                                                                    ),
                                                                                ),
                                                                            },
                                                                    }),
                                                                );
                                                            }
                                                        }}
                                                        onPointerDown={(e) => {
                                                            setSelected(row);
                                                            if (
                                                                !canEdit ||
                                                                busy
                                                            )
                                                                return;
                                                            const pt = point(
                                                                e as unknown as React.PointerEvent<SVGSVGElement>,
                                                            );
                                                            drag.current = {
                                                                id: row.id,
                                                                dx: pt.x - p.x,
                                                                dy: pt.y - p.y,
                                                            };
                                                            svg.current?.setPointerCapture(
                                                                e.pointerId,
                                                            );
                                                        }}
                                                    >
                                                        <rect
                                                            width={92}
                                                            height={45}
                                                            rx={8}
                                                            fill={
                                                                selected?.id ===
                                                                row.id
                                                                    ? "#3153c7"
                                                                    : "#e9efff"
                                                            }
                                                            stroke="#4d6bc4"
                                                        />
                                                        <text
                                                            x={46}
                                                            y={20}
                                                            textAnchor="middle"
                                                            fontSize={11}
                                                            fill={
                                                                selected?.id ===
                                                                row.id
                                                                    ? "white"
                                                                    : "#18315c"
                                                            }
                                                        >
                                                            {String(
                                                                row.datos.tipo,
                                                            )}
                                                        </text>
                                                        <text
                                                            x={46}
                                                            y={36}
                                                            textAnchor="middle"
                                                            fontSize={10}
                                                            fill={
                                                                selected?.id ===
                                                                row.id
                                                                    ? "white"
                                                                    : "#18315c"
                                                            }
                                                        >
                                                            {String(
                                                                row.datos
                                                                    .puertos,
                                                            )}{" "}
                                                            puertos
                                                        </text>
                                                        <text
                                                            x={0}
                                                            y={62}
                                                            fontSize={12}
                                                            fill="#18315c"
                                                        >
                                                            {row.nombre}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>
                                </div>
                                <aside className={styles.card}>
                                    {selected ? (
                                        <>
                                            <h3>{selected.nombre}</h3>
                                            <p className={styles.muted}>
                                                Inventario:{" "}
                                                {String(
                                                    selected.datos
                                                        .numeroInventario,
                                                )}
                                            </p>
                                            <p className={styles.muted}>
                                                Última revisión:{" "}
                                                {String(
                                                    selected.datos
                                                        .ultimaRevision ||
                                                        "Sin registro",
                                                )}
                                                <br />
                                                Mantenimiento:{" "}
                                                {String(
                                                    selected.datos
                                                        .ultimoMantenimiento ||
                                                        "Sin registro",
                                                )}
                                            </p>
                                            <h4>Puertos</h4>
                                            <div className={styles.ports}>
                                                {Array.from(
                                                    {
                                                        length: Math.min(
                                                            192,
                                                            Number(
                                                                selected.datos
                                                                    .puertos,
                                                            ),
                                                        ),
                                                    },
                                                    (_, i) => {
                                                        const port = i + 1,
                                                            edge =
                                                                graph.conexiones.find(
                                                                    (c) =>
                                                                        (c.datos
                                                                            .origenId ===
                                                                            selected.id &&
                                                                            c
                                                                                .datos
                                                                                .puertoOrigen ===
                                                                                port) ||
                                                                        (c.datos
                                                                            .destinoId ===
                                                                            selected.id &&
                                                                            c
                                                                                .datos
                                                                                .puertoDestino ===
                                                                                port),
                                                                ),
                                                            other = edge
                                                                ? graph.dispositivos.find(
                                                                      (d) =>
                                                                          d.id ===
                                                                          (edge
                                                                              .datos
                                                                              .origenId ===
                                                                          selected.id
                                                                              ? edge
                                                                                    .datos
                                                                                    .destinoId
                                                                              : edge
                                                                                    .datos
                                                                                    .origenId),
                                                                  )
                                                                : null;
                                                        return (
                                                            <button
                                                                key={port}
                                                                data-busy={
                                                                    !!edge
                                                                }
                                                                title={
                                                                    edge
                                                                        ? "Conectado: " +
                                                                          (other?.nombre ||
                                                                              "Otra ubicación")
                                                                        : "Disponible"
                                                                }
                                                                onClick={() => {
                                                                    if (edge)
                                                                        setLink(
                                                                            {
                                                                                existing:
                                                                                    edge,
                                                                            },
                                                                        );
                                                                    else if (
                                                                        data!
                                                                            .definitions
                                                                            .conexiones
                                                                            ?.actions
                                                                            .INSERTAR
                                                                    )
                                                                        setLink(
                                                                            {
                                                                                origenId:
                                                                                    selected.id,
                                                                                puertoOrigen:
                                                                                    port,
                                                                            },
                                                                        );
                                                                }}
                                                            >
                                                                {port}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                            {Number(selected.datos.puertos) >
                                                192 && (
                                                <p className={styles.muted}>
                                                    Se muestran 192 puertos. Usa
                                                    el formulario de enlaces
                                                    para los restantes.
                                                </p>
                                            )}
                                            <div className={styles.actions}>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() =>
                                                        setLink({
                                                            device: selected,
                                                        })
                                                    }
                                                >
                                                    Ver ficha
                                                </Button>
                                                {canEdit && (
                                                    <Button
                                                        onClick={() =>
                                                            setEditing(selected)
                                                        }
                                                    >
                                                        Editar
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <p className={styles.muted}>
                                            Selecciona un dispositivo para ver
                                            inventario, revisiones, conexiones y
                                            puertos disponibles.
                                        </p>
                                    )}
                                </aside>
                            </div>
                        </>
                    )}
                </>
            ) : <p className={styles.card}>No tienes registros de red disponibles.</p>}
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
