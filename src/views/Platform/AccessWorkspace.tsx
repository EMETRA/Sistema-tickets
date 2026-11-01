"use client";
import { startTransition, useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Named = { id: number; nombre: string; descripcion: string };
type Catalog = {
    version: number;
    profiles: Named[];
    roles: Named[];
    permissions: Named[];
    users: Named[];
    usersTruncated?: boolean;
    profileRoles: { perfilId: number; rolId: number }[];
    rolePermissions: { rolId: number; permisoId: number }[];
    userRoles: { usuarioId: number; rolId: number }[];
    userPermissions: { usuarioId: number; permisoId: number }[];
};
type Effective = {
    usuarioId: number;
    perfilId: number | null;
    roles: number[];
    rolesAdicionales: number[];
    permisosAdicionales: number[];
    permisos: Named[];
};
function Multi({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: Named[];
    value: number[];
    onChange: (v: number[]) => void;
}) {
    const [q, setQuery] = useState("");
    return (
        <label className={styles.field}>
            {label}
            <input
                className={styles.control}
                placeholder="Filtrar opciones…"
                value={q}
                onChange={(e) => setQuery(e.target.value)}
            />
            <select
                className={styles.control}
                multiple
                size={8}
                value={value.map(String)}
                onChange={(e) =>
                    onChange(
                        Array.from(e.target.selectedOptions, (o) =>
                            Number(o.value),
                        ),
                    )
                }
            >
                {options
                    .filter(
                        (o) =>
                            value.includes(o.id) ||
                            o.nombre.toLowerCase().includes(q.toLowerCase()),
                    )
                    .map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.nombre}
                        </option>
                    ))}
            </select>
            <small className={styles.muted}>
                Ctrl/Cmd para seleccionar varias opciones. {value.length}{" "}
                seleccionadas.
            </small>
        </label>
    );
}
export function AccessWorkspace() {
    const { data: context, refresh } = usePlatform(),
        [catalog, setCatalog] = useState<Catalog | null>(null),
        [tab, setTab] = useState("users"),
        [query, setQuery] = useState(""),
        [error, setError] = useState(""),
        [message, setMessage] = useState(""),
        [revision, setRevision] = useState(0),
        [editing, setEditing] = useState<Named | null | undefined>(),
        [target, setTarget] = useState<unknown>(""),
        [source, setSource] = useState<unknown>(""),
        [effective, setEffective] = useState<Effective | null>(null),
        [preview, setPreview] = useState<{
            agregar: Named[];
            retirar: Named[];
            origen: Effective;
        } | null>(null),
        [profile, setProfile] = useState(""),
        [roles, setRoles] = useState<number[]>([]),
        [permissions, setPermissions] = useState<number[]>([]),
        [busy, setBusy] = useState(false),
        [nombre, setNombre] = useState(""),
        [descripcion, setDescripcion] = useState("");
    const dialog = useRef<HTMLDialogElement>(null),
        [related, setRelated] = useState<number[]>([]);
    useEffect(() => {
        const c = new AbortController();
        platformFetch<Catalog>("/rbac", { signal: c.signal })
            .then(setCatalog)
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            });
        return () => c.abort();
    }, [revision]);
    useEffect(() => {
        startTransition(() => {
            setEffective(null);
        });
        startTransition(() => {
            setPreview(null);
        });
        if (!target) return;
        const c = new AbortController();
        platformFetch<Effective>("/rbac/effective?user=" + target, {
            signal: c.signal,
        })
            .then((v) => {
                setEffective(v);
                setProfile(v.perfilId ? String(v.perfilId) : "");
                setRoles(v.rolesAdicionales);
                setPermissions(v.permisosAdicionales);
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            });
        return () => c.abort();
    }, [target, revision]);
    useEffect(() => {
        startTransition(() => {
            setPreview(null);
        });
        if (!source || !target) return;
        const c = new AbortController();
        platformFetch<{
            agregar: Named[];
            retirar: Named[];
            origen: Effective;
        }>("/rbac/preview?source=" + source + "&target=" + target, {
            signal: c.signal,
        })
            .then(setPreview)
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            });
        return () => c.abort();
    }, [source, target, revision]);
    useEffect(() => {
        if (editing !== undefined) dialog.current?.showModal();
    }, [editing]);
    function edit(row: Named | null) {
        setNombre(row?.nombre || "");
        setDescripcion(row?.descripcion || "");
        setRelated(
            tab === "profiles"
                ? catalog!.profileRoles
                      .filter((x) => x.perfilId === row?.id)
                      .map((x) => x.rolId)
                : tab === "roles"
                  ? catalog!.rolePermissions
                        .filter((x) => x.rolId === row?.id)
                        .map((x) => x.permisoId)
                  : [],
        );
        setEditing(row);
    }
    async function command(
        action: string,
        payload: Record<string, unknown>,
        label: string,
    ) {
        if (!catalog || busy) return;
        setBusy(true);
        setError("");
        try {
            await platformCommand(
                "/rbac/" + action,
                "POST",
                { version: catalog.version, data: payload },
                true,
                label,
            );
            setMessage(
                "Los accesos se actualizaron. Se aplicarán con la siguiente validación de sesión.",
            );
            setRevision((n) => n + 1);
            setEditing(undefined);
            await refresh();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudieron actualizar los accesos.",
            );
        } finally {
            setBusy(false);
        }
    }
    if (!catalog)
        return (
            <div className={styles.card}>
                {error ? (
                    <p className={styles.error}>
                        {error}
                        <button onClick={() => setRevision((n) => n + 1)}>
                            Reintentar
                        </button>
                    </p>
                ) : (
                    <p role="status">Consultando el catálogo de accesos…</p>
                )}
            </div>
        );
    const named =
        tab === "profiles"
            ? catalog.profiles
            : tab === "roles"
              ? catalog.roles
              : catalog.permissions;
    return (
        <section className={styles.page}>
            <nav className={styles.tabs} aria-label="Administración de accesos">
                {[
                    ["users", "Usuarios"],
                    ["profiles", "Perfiles"],
                    ["roles", "Roles"],
                    ["permissions", "Permisos"],
                    ["modules", "Módulos de aplicaciones"],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        aria-current={tab === id ? "page" : undefined}
                        onClick={() => {
                            setTab(id);
                            setQuery("");
                        }}
                    >
                        {label}
                    </button>
                ))}
            </nav>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {message && (
                <p role="status" className={styles.success}>
                    {message}
                </p>
            )}
            {tab === "modules" ? (
                <ResourceWorkspace group="accesos" types={["modulos"]} />
            ) : tab === "users" ? (
                <div className={styles.split}>
                    <section className={styles.card}>
                        <h2>Accesos del colaborador</h2>
                        <PlatformField
                            field={{
                                key: "usuarioDestinoId",
                                label: "Colaborador",
                                type: "user",
                            }}
                            value={target}
                            onChange={setTarget}
                        />
                        {effective && (
                            <div className={styles.page}>
                                <label className={styles.field}>
                                    Perfil base
                                    <select
                                        className={styles.control}
                                        value={profile}
                                        onChange={(e) =>
                                            setProfile(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Sin perfil · permisos individuales
                                        </option>
                                        {catalog.profiles.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <Multi
                                    label="Roles adicionales al perfil"
                                    options={catalog.roles}
                                    value={roles}
                                    onChange={setRoles}
                                />
                                <Multi
                                    label="Permisos individuales adicionales"
                                    options={catalog.permissions}
                                    value={permissions}
                                    onChange={setPermissions}
                                />
                                <Button
                                    state={busy ? "loading" : "default"}
                                    onClick={() =>
                                        void command(
                                            "user-access",
                                            {
                                                usuarioId: Number(target),
                                                perfilId: profile
                                                    ? Number(profile)
                                                    : null,
                                                roles,
                                                permisos: permissions,
                                            },
                                            "Actualizar accesos del colaborador",
                                        )
                                    }
                                >
                                    Revisar y guardar accesos
                                </Button>
                                <h3>Permisos efectivos actuales</h3>
                                <ul className={styles.timeline}>
                                    {effective.permisos.map((p) => (
                                        <li key={p.id}>{p.nombre}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                    <aside className={styles.card}>
                        <h2>Copiar accesos</h2>
                        <p className={styles.muted}>
                            Crea una copia independiente de los permisos
                            efectivos del origen. Los cambios futuros del origen
                            no modificarán esta copia. Reemplaza el perfil y los
                            extras del destino.
                        </p>
                        <PlatformField
                            field={{
                                key: "copiarUsuarioId",
                                label: "Colaborador de origen",
                                type: "user",
                            }}
                            value={source}
                            onChange={setSource}
                        />
                        {preview && (
                            <>
                                <h3>Impacto en el destino</h3>
                                <p className={styles.muted}>
                                    {preview.agregar.length} permisos se agregan
                                    · {preview.retirar.length} se retiran.
                                </p>
                                <details>
                                    <summary>Ver detalle de cambios</summary>
                                    <h4>Agregar</h4>
                                    {preview.agregar.map((p) => (
                                        <p key={p.id}>{p.nombre}</p>
                                    ))}
                                    <h4>Retirar</h4>
                                    {preview.retirar.map((p) => (
                                        <p key={p.id}>{p.nombre}</p>
                                    ))}
                                </details>
                                <Button
                                    state={
                                        busy
                                            ? "loading"
                                            : source === target
                                              ? "disabled"
                                              : "default"
                                    }
                                    onClick={() =>
                                        void command(
                                            "user-access",
                                            {
                                                usuarioId: Number(target),
                                                copiarUsuarioId: Number(source),
                                            },
                                            "Reemplazar accesos mediante copia independiente",
                                        )
                                    }
                                >
                                    Revisar copia
                                </Button>
                            </>
                        )}
                    </aside>
                </div>
            ) : (
                <>
                    <div className={styles.toolbar}>
                        <label className={styles.search}>
                            Buscar
                            <input
                                className={styles.control}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </label>
                        <Button onClick={() => edit(null)}>
                            Crear{" "}
                            {tab === "profiles"
                                ? "perfil"
                                : tab === "roles"
                                  ? "rol"
                                  : "permiso"}
                        </Button>
                    </div>
                    <div className={styles.tableRegion}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {named
                                    .filter((o) =>
                                        o.nombre
                                            .toLowerCase()
                                            .includes(query.toLowerCase()),
                                    )
                                    .map((o) => (
                                        <tr key={o.id}>
                                            <td>{o.nombre}</td>
                                            <td>{o.descripcion}</td>
                                            <td>
                                                <button
                                                    className={styles.link}
                                                    onClick={() => edit(o)}
                                                >
                                                    Editar y ver relaciones
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {editing !== undefined && (
                <dialog
                    ref={dialog}
                    className={styles.dialog}
                    aria-labelledby="access-editor-title"
                    onCancel={(e) => {
                        e.preventDefault();
                        if (!busy) setEditing(undefined);
                    }}
                >
                    <div className={styles.dialogHeader}>
                        <h2 id="access-editor-title">
                            {editing ? "Editar" : "Crear"}{" "}
                            {tab === "profiles"
                                ? "perfil"
                                : tab === "roles"
                                  ? "rol"
                                  : "permiso"}
                        </h2>
                        <Button
                            variant="outlined"
                            state={busy ? "disabled" : "default"}
                            onClick={() => setEditing(undefined)}
                        >
                            Cerrar
                        </Button>
                    </div>
                    <div className={styles.dialogBody}>
                        {error && <p className={styles.error}>{error}</p>}
                        <form
                            className={styles.formGrid}
                            onSubmit={(e) => {
                                e.preventDefault();
                                void command(
                                    tab,
                                    {
                                        ...(editing ? { id: editing.id } : {}),
                                        nombre,
                                        descripcion,
                                    },
                                    "Guardar " + nombre,
                                );
                            }}
                        >
                            <label className={styles.field}>
                                Nombre
                                <input
                                    className={styles.control}
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    maxLength={100}
                                    required
                                />
                            </label>
                            <label className={styles.field}>
                                Descripción
                                <input
                                    className={styles.control}
                                    value={descripcion}
                                    onChange={(e) =>
                                        setDescripcion(e.target.value)
                                    }
                                    maxLength={255}
                                    required
                                />
                            </label>
                            <Button
                                type="submit"
                                state={busy ? "loading" : "default"}
                            >
                                Guardar datos
                            </Button>
                        </form>
                        {editing && tab !== "permissions" && (
                            <>
                                <Multi
                                    label={
                                        tab === "profiles"
                                            ? "Roles del perfil"
                                            : "Permisos del rol"
                                    }
                                    options={
                                        tab === "profiles"
                                            ? catalog.roles
                                            : catalog.permissions
                                    }
                                    value={related}
                                    onChange={setRelated}
                                />
                                <Button
                                    state={busy ? "loading" : "default"}
                                    onClick={() =>
                                        void command(
                                            tab === "profiles"
                                                ? "profile-roles"
                                                : "role-permissions",
                                            tab === "profiles"
                                                ? {
                                                      perfilId: editing.id,
                                                      roles: related,
                                                  }
                                                : {
                                                      rolId: editing.id,
                                                      permisos: related,
                                                  },
                                            "Reemplazar relaciones de " +
                                                editing.nombre,
                                        )
                                    }
                                >
                                    Revisar relaciones
                                </Button>
                            </>
                        )}
                        {editing && (
                            <Button
                                variant="outlined"
                                state={busy ? "disabled" : "default"}
                                onClick={() =>
                                    void command(
                                        tab,
                                        { id: editing.id, eliminar: true },
                                        "Eliminar acceso sin asignaciones: " +
                                            editing.nombre,
                                    )
                                }
                            >
                                Eliminar si no está asignado
                            </Button>
                        )}
                    </div>
                </dialog>
            )}
            <p className={styles.muted}>
                La administración se valida con permisos actuales del servidor.
                Sesión: {context!.actor.nombre}.
            </p>
        </section>
    );
}
