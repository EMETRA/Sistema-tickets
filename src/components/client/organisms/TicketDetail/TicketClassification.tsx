"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import {
    platformCommand,
    platformFetch,
    PlatformError,
} from "@/platform/client";
import { AdministrativeChangeCancelled } from "@/api/administrative-confirmation";
import { TagInput } from "@/components/client/molecules/TagInput/TagInput";
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
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const [createdTags, setCreatedTags] = useState<Tag[]>([]),
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
        ...new Map(
            [...savedTags, ...createdTags, ...catalog].map((tag) => [
                tag.id,
                tag,
            ]),
        ).values(),
    ];
    const fold = (value: string) =>
        value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("es")
            .trim()
            .replace(/\s+/g, " ");
    function select(next: string[]) {
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
            setCatalogMessage("");
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
    async function manageCatalog(initial = false, name = "") {
        setBusy(true);
        onBusyChange(true);
        setError("");
        setCatalogMessage("");
        setReference(undefined);
        try {
            const result = await platformCommand<{
                etiquetas: {
                    id: number;
                    nombre: string;
                    color: string | null;
                }[];
            }>(
                "/tickets/tag-catalog" + (initial ? "/initialize" : ""),
                "POST",
                initial ? {} : { nombre: name, color: "#4763E4" },
                true,
                initial
                    ? "Crear etiquetas iniciales de trabajo"
                    : "Crear etiqueta " + name,
            );
            if (!initial) {
                const tag = result.etiquetas.find(
                    (t) => fold(t.nombre.trim()) === fold(name.trim()),
                );
                if (!tag)
                    throw new Error(
                        "La etiqueta se creó pero no pudo seleccionarse. Actualiza el catálogo antes de continuar.",
                    );
                const created = { ...tag, id: String(tag.id) };
                setCreatedTags((previous) => [
                    ...previous.filter((t) => t.id !== created.id),
                    created,
                ]);
                if (!selected.includes(created.id))
                    select([...selected, created.id]);
            }
            await onCatalogChanged?.();
            setCatalogMessage(
                initial
                    ? "Catálogo inicial disponible. Ya puedes escoger etiquetas."
                    : "Etiqueta creada y seleccionada. Guarda las etiquetas para aplicarla al ticket.",
            );
            return true;
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
            return false;
        } finally {
            setBusy(false);
            onBusyChange(false);
        }
    }
    return (
        <div className={styles.classification}>
            {admin && catalogReady && !catalog.length && (
                <section aria-label="Administrar catálogo de etiquetas">
                    <p>
                        El catálogo está vacío. Puedes cargar Mantenimiento,
                        Reporte, Formulario, Instalación, Limpieza y
                        Diagnóstico.
                    </p>
                    <Button
                        type="button"
                        variant="outlined"
                        state={busy ? "loading" : "default"}
                        onClick={() => void manageCatalog(true)}
                    >
                        Crear etiquetas iniciales
                    </Button>
                </section>
            )}
            {catalogMessage && <p role="status">{catalogMessage}</p>}
            {error && applied && !(editable && applied.puedeEditar) && (
                <p role="alert">
                    {error}
                    {reference ? " Referencia: " + reference : ""}
                </p>
            )}
            {!(applied && editable && applied.puedeEditar) && (
                <div
                    className={styles.applied}
                    aria-label="Etiquetas guardadas"
                >
                    {savedTags.length ? (
                        savedTags.map((tag) => (
                            <span key={tag.id}>{tag.nombre}</span>
                        ))
                    ) : (
                        <p>Sin etiquetas guardadas.</p>
                    )}
                </div>
            )}
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
                    <TagInput
                        options={options}
                        value={selected}
                        onChange={select}
                        disabled={busy || !catalogReady}
                        onCreate={
                            admin && catalogReady
                                ? (name) => manageCatalog(false, name)
                                : undefined
                        }
                    />
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
