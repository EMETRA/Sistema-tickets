"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePlatform } from "@/platform/context";
import { Button } from "@/components/client/atoms/Button";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export type OrganizationPerson = {
    empresa: number;
    empleado: number;
    nombre: string;
    puesto: string;
    unidadCodigo?: number | null;
    unidad: string | null;
    sinUnidad: boolean;
    cuentasHabilitadas: number;
    usuariosIds?: number[];
};
const searchText = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
export function OrganizationPeople({
    people,
}: {
    people: OrganizationPerson[];
}) {
    const { data } = usePlatform();
    const [query, setQuery] = useState(""),
        [filter, setFilter] = useState("TODOS"),
        [page, setPage] = useState(0);
    const filtered = useMemo(
        () =>
            people.filter(
                (person) =>
                    (filter === "TODOS" ||
                        (filter === "SIN_CUENTA" &&
                            !person.cuentasHabilitadas) ||
                        (filter === "SIN_UNIDAD" && person.sinUnidad)) &&
                    searchText(
                        [
                            person.empleado,
                            person.nombre,
                            person.puesto,
                            person.unidadCodigo ?? "",
                            person.unidad || "",
                        ].join(" "),
                    ).includes(searchText(query)),
            ),
        [people, query, filter],
    );
    const offset = page * 25;
    return (
        <section aria-label="Personal de RRHH" className={styles.page}>
            <div className={styles.toolbar}>
                <label className={styles.search}>
                    Buscar persona, puesto o código
                    <input
                        className={styles.control}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(0);
                        }}
                    />
                </label>
                <label className={styles.field}>
                    Mostrar personal
                    <select
                        className={styles.control}
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="TODOS">
                            Todos los empleados activos
                        </option>
                        <option value="SIN_CUENTA">
                            Sin cuenta habilitada
                        </option>
                        <option value="SIN_UNIDAD">Unidad pendiente</option>
                    </select>
                </label>
            </div>
            <div className={styles.tableRegion}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Nombre</th>
                            <th>Puesto</th>
                            <th>Unidad institucional</th>
                            <th>Cuenta en Tickets</th>
                            {data?.definitions.activos?.actions.LEER && (
                                <th>Bienes</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(offset, offset + 25).map((person) => (
                            <tr key={person.empresa + ":" + person.empleado}>
                                <td>{person.empleado}</td>
                                <td>{person.usuariosIds?.length===1?<Link className={styles.link} href={'/equipo/'+person.usuariosIds[0]}>{person.nombre}</Link>:person.nombre}</td>
                                <td>{person.puesto}</td>
                                <td>
                                    {person.unidad ||
                                        (person.unidadCodigo != null
                                            ? `Unidad ${person.unidadCodigo} · Nombre pendiente`
                                            : "Pendiente de vincular")}
                                </td>
                                <td>
                                    {person.cuentasHabilitadas
                                        ? "Habilitada"
                                        : "Sin cuenta habilitada"}
                                </td>
                                {data?.definitions.activos?.actions.LEER && (
                                    <td>
                                        <Link className={styles.link} href={"/espacio/inventario?view=inventario&empleado="+person.empleado}>Ver bienes</Link>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {!filtered.length && (
                            <tr>
                                <td
                                    colSpan={
                                        data?.definitions.activos?.actions.LEER
                                            ? 6
                                            : 5
                                    }
                                >
                                    No hay empleados que coincidan con estos
                                    filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className={styles.toolbar}>
                <p>
                    {filtered.length} empleados · Página {page + 1} de{" "}
                    {Math.max(1, Math.ceil(filtered.length / 25))}
                </p>
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        state={page === 0 ? "disabled" : "default"}
                        onClick={() => setPage((v) => v - 1)}
                    >
                        Anterior personal
                    </Button>
                    <Button
                        variant="outlined"
                        state={
                            offset + 25 >= filtered.length
                                ? "disabled"
                                : "default"
                        }
                        onClick={() => setPage((v) => v + 1)}
                    >
                        Siguiente personal
                    </Button>
                </div>
            </div>

        </section>
    );
}
