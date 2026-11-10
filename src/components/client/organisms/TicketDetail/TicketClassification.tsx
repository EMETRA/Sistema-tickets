"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import {
    platformCommand,
    platformFetch,
    PlatformError,
} from "@/platform/client";
import { AdministrativeChangeCancelled } from "@/api/administrative-confirmation";
import styles from "./TicketClassification.module.scss";
type Tag = { id: string; nombre: string; color?: string | null };
export function TicketClassification({
    ticketId,
    catalog,
    editable,
    admin,
    onSaved,
    onDirtyChange,
    onBusyChange,
    onCountChange,
    onCatalogChanged,
    catalogReady = true,
}: {
    ticketId: string;
    catalog: Tag[];
    editable: boolean;
    admin: boolean;
    onSaved: () => Promise<void>;
    onDirtyChange: (dirty: boolean) => void;
    onBusyChange: (busy: boolean) => void;
    onCountChange: (count: number | null) => void;
    onCatalogChanged?: () => Promise<unknown>;
    catalogReady?: boolean;
}) {
    const [selected, setSelected] = useState<string[]>([]),
        [search, setSearch] = useState(""),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const [newName, setNewName] = useState(""),
        [newColor, setNewColor] = useState("#4763E4"),
        [catalogMessage, setCatalogMessage] = useState("");
    const [reference, setReference] = useState<string>();
    const [saved, setSaved] = useState(false);
    const [applied, setApplied] = useState<{
            version: number;
            etiquetas: Tag[];
            puedeEditar: boolean;
        } | null>(null),
        [revision, setRevision] = useState(0),
        [loading, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        setSaved(false);
        setReference(undefined);
        onCountChange(null);
        platformFetch<{
            version: number;
            etiquetas: { id: number; nombre: string; color: string | null }[];
            puedeEditar: boolean;
        }>(`/tickets/${ticketId}/tags`, { signal: controller.signal })
            .then((result) => {
                if (controller.signal.aborted) return;
                const loaded = {
                    ...result,
                    etiquetas: result.etiquetas.map((tag) => ({
                        ...tag,
                        id: String(tag.id),
                    })),
                };
                setApplied(loaded);
                setSelected(loaded.etiquetas.map((tag) => tag.id));
                onDirtyChange(false);
                onCountChange(loaded.etiquetas.length);
            })
            .catch((failure) => {
                if (!controller.signal.aborted) {
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : "No se pudieron consultar las etiquetas.",
                    );
                    setReference(
                        failure instanceof PlatformError
                            ? failure.reference
                            : undefined,
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [ticketId, revision, onDirtyChange, onCountChange]);
    const savedTags = applied?.etiquetas || [];
    const same = (ids: string[]) =>
        ids.length === savedTags.length &&
        savedTags.every((tag) => ids.includes(tag.id));
    const dirty = !same(selected);
    const options = [
        ...catalog,
        ...savedTags.filter(
            (tag) => !catalog.some((item) => item.id === tag.id),
        ),
    ];
    const fold = (value: string) =>
        value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("es");
    const visible = options.filter((tag) =>
        fold(tag.nombre).includes(fold(search)),
    );
    function toggle(id: string) {
        const next = selected.includes(id)
            ? selected.filter((value) => value !== id)
            : [...selected, id];
        setSelected(next);
        setSaved(false);
        onDirtyChange(!same(next));
        setError("");
    }
    async function save() {
        if (!applied) return;
        setBusy(true);
        onBusyChange(true);
        setError("");
        setReference(undefined);
        try {
            const result = await platformCommand<{
                version: number;
                etiquetas: {
                    id: number;
                    nombre: string;
                    color: string | null;
                }[];
            }>(
                `/tickets/${Number(ticketId)}/tags`,
                "POST",
                {
                    version: applied.version,
                    tagIds: selected.map(Number).sort((a, b) => a - b),
                },
                admin,
                `Clasificar ticket #${ticketId}: ${
                    options
                        .filter((tag) => selected.includes(tag.id))
                        .map((tag) => tag.nombre)
                        .join(", ") || "Sin etiquetas"
                }`,
            );
            setApplied({
                ...applied,
                version: result.version,
                etiquetas: result.etiquetas.map((tag) => ({
                    ...tag,
                    id: String(tag.id),
                })),
            });
            onDirtyChange(false);
            onCountChange(result.etiquetas.length);
            await onSaved();
            setSaved(true);
        } catch (failure) {
            if (!(failure instanceof AdministrativeChangeCancelled)) {
                setError(
                    failure instanceof Error
                        ? failure.message
                        : "No se pudieron guardar las etiquetas. Conservamos tu selección para reintentar.",
                );
                setReference(
                    failure instanceof PlatformError
                        ? failure.reference
                        : undefined,
                );
            }
        } finally {
            setBusy(false);
            onBusyChange(false);
        }
    }
    async function manageCatalog(initial = false) {
        setBusy(true);
        onBusyChange(true);
        setError("");
        setCatalogMessage("");
        setReference(undefined);
        try {
            await platformCommand(
                "/tickets/tag-catalog" + (initial ? "/initialize" : ""),
                "POST",
                initial ? {} : { nombre: newName, color: newColor },
                true,
                initial
                    ? "Crear etiquetas iniciales de trabajo"
                    : "Crear etiqueta " + newName,
            );
            await onCatalogChanged?.();
            setNewName("");
            setCatalogMessage(
                initial
                    ? "Catálogo inicial disponible. Ya puedes escoger etiquetas."
                    : "Etiqueta creada. Ya puedes seleccionarla.",
            );
        } catch (failure) {
            if (!(failure instanceof AdministrativeChangeCancelled)) {
                setError(
                    failure instanceof Error
                        ? failure.message
                        : "No se pudo actualizar el catálogo",
                );
                setReference(
                    failure instanceof PlatformError
                        ? failure.reference
                        : undefined,
                );
            }
        } finally {
            setBusy(false);
            onBusyChange(false);
        }
    }
    return (
        <div className={styles.classification}>
            {admin && catalogReady && (
                <section aria-label="Administrar catálogo de etiquetas">
                    {!catalog.length && (
                        <>
                            <p>
                                El catálogo está vacío. Puedes cargar
                                Mantenimiento, Reporte, Formulario, Instalación,
                                Limpieza y Diagnóstico.
                            </p>
                            <Button
                                type="button"
                                variant="outlined"
                                state={busy ? "loading" : "default"}
                                onClick={() => void manageCatalog(true)}
                            >
                                Crear etiquetas iniciales
                            </Button>
                        </>
                    )}
                    <details>
                        <summary>Nueva etiqueta de trabajo</summary>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                void manageCatalog();
                            }}
                        >
                            <label className={styles.search}>
                                Nombre de la etiqueta
                                <input
                                    aria-label="Nombre de la etiqueta"
                                    required
                                    maxLength={50}
                                    value={newName}
                                    disabled={busy}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </label>
                            <label className={styles.search}>
                                Color de la etiqueta
                                <input
                                    aria-label="Color de la etiqueta"
                                    type="color"
                                    value={newColor}
                                    disabled={busy}
                                    onChange={(e) =>
                                        setNewColor(e.target.value)
                                    }
                                />
                            </label>
                            <Button
                                type="submit"
                                state={busy ? "loading" : "default"}
                            >
                                Crear etiqueta
                            </Button>
                        </form>
                    </details>
                    {catalogMessage && <p role="status">{catalogMessage}</p>}
                    {error && (
                        <p role="alert">
                            {error}
                            {reference ? " Referencia: " + reference : ""}
                        </p>
                    )}
                </section>
            )}
            <div className={styles.applied} aria-label="Etiquetas guardadas">
                {savedTags.length ? (
                    savedTags.map((tag) => (
                        <span key={tag.id}>{tag.nombre}</span>
                    ))
                ) : (
                    <p>Sin etiquetas guardadas.</p>
                )}
            </div>
            {loading && <p role="status">Consultando clasificación…</p>}
            {!loading && error && !applied && (
                <div role="alert">
                    <p>{error}</p>
                    {reference && <p>Referencia: {reference}</p>}
                    <Button
                        variant="outlined"
                        onClick={() => setRevision((value) => value + 1)}
                    >
                        Reintentar etiquetas
                    </Button>
                </div>
            )}
            {!loading && applied && editable && applied.puedeEditar ? (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void save();
                    }}
                >
                    <p>
                        Clasifica el trabajo realizado. Guarda al menos una
                        etiqueta antes de resolver el ticket.
                    </p>
                    <label className={styles.search}>
                        Buscar etiqueta
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            disabled={busy}
                        />
                    </label>
                    <fieldset disabled={busy} className={styles.options}>
                        <legend>Tipos de trabajo</legend>
                        {visible.map((tag) => (
                            <label key={tag.id}>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(tag.id)}
                                    disabled={
                                        !selected.includes(tag.id) &&
                                        selected.length >= 10
                                    }
                                    onChange={() => toggle(tag.id)}
                                />
                                <span>{tag.nombre}</span>
                            </label>
                        ))}
                        {!visible.length && (
                            <p>
                                {catalog.length
                                    ? "No hay etiquetas con ese nombre."
                                    : "El catálogo está vacío. Solicita que se carguen las etiquetas de trabajo."}
                            </p>
                        )}
                    </fieldset>
                    <p className={styles.count}>
                        {selected.length} de 10 seleccionadas
                        {dirty ? " · Cambios sin guardar" : ""}
                    </p>
                    {saved && <p role="status">Etiquetas guardadas.</p>}
                    {error && (
                        <div role="alert">
                            <p>{error}</p>
                            {reference && <p>Referencia: {reference}</p>}
                            <Button
                                type="button"
                                variant="outlined"
                                state={busy ? "disabled" : "default"}
                                onClick={() =>
                                    setRevision((value) => value + 1)
                                }
                            >
                                Actualizar etiquetas guardadas
                            </Button>
                            <p>
                                Actualizar recupera la clasificación del
                                servidor y descarta la selección pendiente.
                            </p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        state={
                            busy ? "loading" : !dirty ? "disabled" : "default"
                        }
                    >
                        Guardar etiquetas
                    </Button>
                </form>
            ) : (
                !loading &&
                applied && (
                    <p>
                        Las etiquetas se gestionan por el responsable después de
                        la asignación, mientras el ticket está abierto.
                    </p>
                )
            )}
        </div>
    );
}
