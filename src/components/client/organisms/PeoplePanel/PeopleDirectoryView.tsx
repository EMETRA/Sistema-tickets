"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { OrganizationPerson } from "../OrganizationPeople/OrganizationPeople";
import common from "../../templates/PlatformPage/PlatformPage.module.scss";
import tiles from "../AssetsPanel/AssetsPanel.module.scss";
import styles from "./PeoplePanel.module.scss";

type Filter = "TODOS" | "CON_CUENTA" | "SIN_CUENTA" | "SIN_UNIDAD";
const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "?";
const PREVIEW = 12;

/** Propuesta: el personal de RRHH como directorio por unidad, con el estado de su cuenta. */
export function PeopleDirectoryView({
    people,
    onRefresh,
}: {
    people: OrganizationPerson[];
    onRefresh: () => void;
}) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("TODOS");
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const withAccount = people.filter((p) => p.cuentasHabilitadas > 0).length;
    const noUnit = people.filter((p) => p.sinUnidad).length;
    const groups = useMemo(() => {
        const q = norm(query.trim());
        const matches = people.filter(
            (p) =>
                (filter === "TODOS" ||
                    (filter === "CON_CUENTA" && p.cuentasHabilitadas > 0) ||
                    (filter === "SIN_CUENTA" && !p.cuentasHabilitadas) ||
                    (filter === "SIN_UNIDAD" && p.sinUnidad)) &&
                norm(`${p.empleado} ${p.nombre} ${p.puesto} ${p.unidad || ""}`).includes(q),
        );
        const map = new Map<string, OrganizationPerson[]>();
        for (const p of matches) {
            const key = p.unidad || "Sin unidad asignada";
            map.set(key, [...(map.get(key) || []), p]);
        }
        return [...map.entries()]
            .map(([unit, list]) => ({
                unit,
                list: list.sort((a, b) => a.nombre.localeCompare(b.nombre)),
                noUnit: !list[0].unidad,
            }))
            .sort(
                (a, b) =>
                    Number(a.noUnit) - Number(b.noUnit) ||
                    b.list.length - a.list.length ||
                    a.unit.localeCompare(b.unit),
            );
    }, [people, query, filter]);
    const total = groups.reduce((n, g) => n + g.list.length, 0);

    return (
        <section className={styles.directory} aria-label="Personal de RRHH">
            <div className={tiles.overview} role="group" aria-label="Resumen del personal">
                {(
                    [
                        ["TODOS", "Empleados activos", people.length, "Según RRHH", "info"],
                        ["CON_CUENTA", "Con cuenta en el panel", withAccount, "Pueden ingresar", "success"],
                        [
                            "SIN_CUENTA",
                            "Sin cuenta",
                            people.length - withAccount,
                            "Aún no ingresan al panel",
                            people.length - withAccount ? "warning" : "neutral",
                        ],
                        [
                            "SIN_UNIDAD",
                            "Sin unidad",
                            noUnit,
                            "Revisar en RRHH",
                            noUnit ? "danger" : "neutral",
                        ],
                    ] as const
                ).map(([id, label, value, hint, tone]) => (
                    <button
                        key={id}
                        type="button"
                        className={tiles.tile}
                        data-tone={tone}
                        aria-pressed={filter === id}
                        onClick={() => setFilter(id)}
                    >
                        <span className={tiles.tileLabel}>{label}</span>
                        <strong>{value}</strong>
                        <small>{hint}</small>
                    </button>
                ))}
            </div>
            <div className={styles.bar}>
                <input
                    type="search"
                    className={styles.search}
                    placeholder="Buscar por nombre, puesto, unidad o código de empleado…"
                    aria-label="Buscar persona"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <span className={styles.count}>
                    {total} {total === 1 ? "persona" : "personas"} en {groups.length}{" "}
                    {groups.length === 1 ? "unidad" : "unidades"}
                </span>
                <button type="button" className={styles.ghost} onClick={onRefresh}>
                    Actualizar
                </button>
            </div>
            {groups.map(({ unit, list, noUnit: missing }) => {
                const open = expanded[unit] || list.length <= PREVIEW;
                const accounts = list.filter((p) => p.cuentasHabilitadas > 0).length;
                return (
                    <section
                        key={unit}
                        className={styles.unit}
                        data-missing={missing || undefined}
                        aria-label={unit}
                    >
                        <header>
                            <h3>{unit}</h3>
                            <span>
                                {list.length} {list.length === 1 ? "persona" : "personas"} · {accounts} con
                                cuenta
                            </span>
                        </header>
                        <ul className={styles.people}>
                            {(open ? list : list.slice(0, PREVIEW)).map((p) => {
                                const account = p.cuentasHabilitadas > 0;
                                return (
                                    <li key={`${p.empresa}:${p.empleado}`} className={styles.person}>
                                        <span
                                            className={styles.avatar}
                                            data-account={account || undefined}
                                            aria-hidden="true"
                                        >
                                            {initials(p.nombre)}
                                        </span>
                                        <div className={styles.personText}>
                                            {p.usuariosIds?.length === 1 ? (
                                                <Link
                                                    href={"/equipo/" + p.usuariosIds[0]}
                                                    className={styles.name}
                                                >
                                                    {p.nombre}
                                                </Link>
                                            ) : (
                                                <strong className={styles.name}>{p.nombre}</strong>
                                            )}
                                            <small>
                                                {p.puesto || "Puesto sin registrar"} · {p.empleado}
                                            </small>
                                            <span className={styles.personActions}>
                                                <span
                                                    className={common.chip}
                                                    data-tone={account ? "success" : "warning"}
                                                >
                                                    {account ? "Con cuenta" : "Sin cuenta"}
                                                </span>
                                                <Link
                                                    className={common.link}
                                                    href={
                                                        "/espacio/inventario?view=inventario&empleado=" +
                                                        p.empleado
                                                    }
                                                >
                                                    Ver bienes
                                                </Link>
                                                {!account && (
                                                    <Link className={common.link} href="/espacio/solicitudes">
                                                        Solicitar cuenta
                                                    </Link>
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {!open && (
                            <button
                                type="button"
                                className={styles.more}
                                onClick={() => setExpanded((e) => ({ ...e, [unit]: true }))}
                            >
                                Ver las {list.length - PREVIEW} personas restantes
                            </button>
                        )}
                    </section>
                );
            })}
            {!groups.length && <p className={styles.empty}>Nadie coincide con la búsqueda o el filtro.</p>}
        </section>
    );
}
export default PeopleDirectoryView;
