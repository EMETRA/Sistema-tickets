"use client";
import { useMemo, useState } from "react";
import { usePlatform } from "@/platform/context";
import { InventoryWorkspace } from "../ResourceWorkspace/InventoryWorkspace";
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
    const [employee, setEmployee] = useState<number | null>(null);
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
            <div>
                <h3>Personal consultado en RRHH</h3>
                <p className={styles.muted}>
                    Incluye empleados activos aunque todavía no tengan cuenta en
                    Tickets. Las jefaturas se revisan por su puesto; no se
                    conceden permisos por aparecer en este listado.
                </p>
            </div>
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
                                <td>{person.nombre}</td>
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
                                        <Button
                                            variant="outlined"
                                            onClick={() =>
                                                setEmployee(person.empleado)
                                            }
                                        >
                                            Ver bienes de {person.empleado}
                                        </Button>
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
            {employee && (
                <section aria-label="Bienes del empleado seleccionado">
                    <Button
                        variant="outlined"
                        onClick={() => setEmployee(null)}
                    >
                        Cerrar bienes
                    </Button>
                    <InventoryWorkspace key={employee} empleado={employee} />
                </section>
            )}
        </section>
    );
}
