"use client";
import { useEffect, useId, useState } from "react";
import { platformFetch } from "@/platform/client";
import type { Field, PageResult, PlatformRecord } from "@/platform/types";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
type Option = { id: string | number; nombre: string };
export function PlatformField({
    field,
    value,
    onChange,
    disabled,
}: {
    field: Field;
    value: unknown;
    onChange: (value: unknown) => void;
    disabled?: boolean;
}) {
    const id = useId(),
        [query, setQuery] = useState(""),
        [options, setOptions] = useState<Option[]>([]),
        [error, setError] = useState("");
    const permissionCode = ["leer", "insertar", "editar", "eliminar"].includes(
        field.key,
    );
    const access =
        permissionCode ||
        field.key === "perfilId" ||
        (field.type === "list" && ["roles", "permisos"].includes(field.key));
    useEffect(() => {
        if (!access && !["ref", "user", "list"].includes(field.type)) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setError("");
            const path = access
                ? "/access-options"
                : field.type === "user" || field.type === "list"
                  ? (field.lookupPath || "/people") +
                    "?q=" +
                    encodeURIComponent(query)
                  : "/records/" +
                    field.resource +
                    "?limit=50&q=" +
                    encodeURIComponent(query);
            platformFetch<
                | PageResult<PlatformRecord>
                | Option[]
                | { profiles: Option[]; roles: Option[]; permissions: Option[] }
            >(path, { signal: controller.signal })
                .then((result) => {
                    if (controller.signal.aborted) return;
                    if (access) {
                        const catalog = result as {
                            profiles: Option[];
                            roles: Option[];
                            permissions: Option[];
                        };
                        setOptions(
                            permissionCode
                                ? catalog.permissions.map((p) => ({
                                      id: p.nombre,
                                      nombre: p.nombre,
                                  }))
                                : field.key === "perfilId"
                                  ? catalog.profiles
                                  : field.key === "roles"
                                    ? catalog.roles
                                    : catalog.permissions,
                        );
                    } else
                        setOptions(
                            Array.isArray(result)
                                ? result
                                : (result as PageResult<PlatformRecord>).items,
                        );
                })
                .catch((e) => {
                    if (!controller.signal.aborted) setError(e.message);
                });
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [
        access,
        permissionCode,
        field.type,
        field.resource,
        field.key,
        field.lookupPath,
        query,
    ]);
    let control: React.ReactNode;
    if (field.type === "boolean")
        control = (
            <input
                id={id}
                type="checkbox"
                checked={Boolean(value)}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
        );
    else if (field.type === "textarea")
        control = (
            <textarea
                id={id}
                className={styles.control}
                rows={4}
                value={String(value ?? "")}
                required={field.required}
                disabled={disabled}
                maxLength={8000}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    else if (field.type === "select")
        control = (
            <select
                id={id}
                className={styles.control}
                value={String(value ?? "")}
                disabled={disabled}
                required={field.required}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Seleccionar…</option>
                {field.options?.map((option) => (
                    <option key={option} value={option}>
                        {option.replaceAll("_", " ")}
                    </option>
                ))}
            </select>
        );
    else if (access || ["ref", "user", "list"].includes(field.type))
        control = (
            <>
                <input
                    className={styles.control}
                    aria-label={"Buscar " + field.label}
                    placeholder="Buscar por nombre…"
                    disabled={disabled}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <select
                    id={id}
                    className={styles.control}
                    multiple={field.type === "list"}
                    size={field.type === "list" ? 6 : undefined}
                    value={
                        field.type === "list"
                            ? Array.isArray(value)
                                ? value.map(String)
                                : []
                            : String(value ?? "")
                    }
                    disabled={disabled}
                    required={field.required}
                    onChange={(e) =>
                        onChange(
                            field.type === "list"
                                ? Array.from(e.target.selectedOptions, (o) =>
                                      Number(o.value),
                                  )
                                : field.type === "user" ||
                                    field.key === "perfilId"
                                  ? e.target.value
                                      ? Number(e.target.value)
                                      : ""
                                  : e.target.value,
                        )
                    }
                >
                    {field.type !== "list" && (
                        <option value="">Seleccionar…</option>
                    )}
                    {!!value &&
                        field.type !== "list" &&
                        !options.some(
                            (o) => String(o.id) === String(value),
                        ) && (
                            <option value={String(value)}>
                                Selección actual
                            </option>
                        )}
                    {options
                        .filter(
                            (o) =>
                                !query ||
                                o.nombre
                                    .toLowerCase()
                                    .includes(query.toLowerCase()),
                        )
                        .map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.nombre}
                            </option>
                        ))}
                </select>
                {field.type === "list" && (
                    <small className={styles.muted}>
                        Puedes seleccionar varias opciones con Ctrl o Cmd. Las
                        selecciones se muestran resaltadas.
                    </small>
                )}
                {error && (
                    <span role="alert" className={styles.error}>
                        {error}
                    </span>
                )}
            </>
        );
    else {
        const date = field.type === "datetime",
            type = date
                ? "datetime-local"
                : field.type === "date"
                  ? "date"
                  : field.type === "number"
                    ? "number"
                    : field.type === "url"
                      ? "url"
                      : "text";
        let display = String(value ?? "");
        if (date && display) {
            const d = new Date(display);
            if (Number.isFinite(+d))
                display = new Date(+d - 6 * 3600000).toISOString().slice(0, 16);
        }
        control = (
            <input
                id={id}
                className={styles.control}
                type={type}
                value={display}
                min={field.min}
                max={field.max}
                required={field.required}
                disabled={disabled}
                maxLength={500}
                onChange={(e) =>
                    onChange(
                        date
                            ? e.target.value
                                ? new Date(
                                      e.target.value + ":00-06:00",
                                  ).toISOString()
                                : ""
                            : field.type === "number"
                              ? e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              : e.target.value,
                    )
                }
            />
        );
    }
    return (
        <div className={styles.field}>
            <label htmlFor={id}>
                {field.label}
                {field.required && <span aria-label="obligatorio"> *</span>}
                {field.type === "datetime" && " · Guatemala"}
            </label>
            {control}
        </div>
    );
}
