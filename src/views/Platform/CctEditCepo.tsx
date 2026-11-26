"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopOver } from "@/components/client/atoms/PopOver";
import { Button } from "@/components/client/atoms/Button";
import { platformCommand } from "@/platform/client";
import { cctCivilNow, cctEditSchema, type CctCepo, type CctEditValues } from "@/platform/cct";
import { CctPicker, cctError } from "./CctParts";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./CctWorkspace.module.scss";
export function CctEditCepo({
    detail,
    admin,
    onDone,
    onCancel,
}: {
    detail: CctCepo;
    admin: boolean;
    onDone: () => void;
    onCancel: () => void;
}) {
    const d = detail.datos;
    const { register, handleSubmit, setValue, control, formState } = useForm<CctEditValues>({
        resolver: zodResolver(cctEditSchema),
        defaultValues: {
            crucero: d.CRUCERO || "",
            tipoAgente: d.TIPO_AGENTE || "",
            agente: d.AGENTE || "",
            delegacion: d.DELEGACION || "",
            motivo: d.MOTIVO || "",
            cepoFisico: d.CEPO_FISICO || "",
            fecha: d.FECHA || "",
            observaciones: d.OBSERVACIONES || "",
        },
    });
    const errors = formState.errors;
    const pickers = useWatch({ control, name: ["crucero", "motivo", "delegacion", "tipoAgente"] });
    const [busy, setBusy] = useState(false),
        [accepted, setAccepted] = useState(false),
        [error, setError] = useState("");
    const active = useRef(true),
        flight = useRef(false);
    useEffect(() => {
        active.current = true;
        return () => {
            active.current = false;
        };
    }, []);
    // Cualquier cambio pide volver a confirmar la revisión.
    const changed = { onChange: () => setAccepted(false) };
    const submit = handleSubmit(async (form) => {
        if (!accepted || flight.current) return;
        flight.current = true;
        setBusy(true);
        setError("");
        try {
            await platformCommand(
                "/cct/cepos/" + d.AVISO + "/editar",
                "POST",
                { version: detail.version, data: form },
                admin,
                "Editar colocación del aviso " + d.AVISO,
            );
            if (active.current) onDone();
        } catch (e) {
            if (active.current) setError(cctError(e));
        } finally {
            flight.current = false;
            if (active.current) setBusy(false);
        }
    });
    const fail = (id: string, message?: string) =>
        message ? (
            <p role="alert" id={id + "-error"} className={styles.error}>
                {message}
            </p>
        ) : null;
    return (
        <PopOver
            isOpen
            onClose={() => {
                if (!flight.current) onCancel();
            }}
            ariaLabel="Editar colocación"
            className={local.formDialog}
        >
            <section className={local.dialogBody} aria-label="Editar colocación">
                <div className={styles.toolbar}>
                    <h3>Editar colocación · Aviso {d.AVISO}</h3>
                    <Button variant="outlined" onClick={onCancel} state={busy ? "disabled" : "default"}>
                        Cancelar edición
                    </Button>
                </div>
                <p className={local.hint}>
                    Revisa lugar, motivo, agente y fecha. Se conserva el número del aviso y su vehículo. La
                    edición queda registrada en la auditoría.
                </p>
                <form onSubmit={submit} noValidate>
                    <div className={local.form}>
                        {(
                            [
                                ["crucero", "cruceros", "Crucero"],
                                ["motivo", "motivos", "Motivo"],
                                ["delegacion", "delegaciones", "Delegación"],
                                ["tipoAgente", "agentes", "Tipo de agente"],
                            ] as const
                        ).map(([key, kind, label], i) => (
                            <div key={key}>
                                <CctPicker
                                    kind={kind}
                                    label={label}
                                    value={pickers[i]}
                                    onChange={(v) => {
                                        setValue(key, v, { shouldValidate: formState.isSubmitted });
                                        setAccepted(false);
                                    }}
                                    disabled={busy}
                                />
                                {fail("cct-edit-" + key, errors[key]?.message)}
                            </div>
                        ))}
                        <div>
                            <label htmlFor="cct-edit-agent">Chapa del agente *</label>
                            <input
                                id="cct-edit-agent"
                                className={styles.control}
                                inputMode="numeric"
                                {...register("agente", changed)}
                                aria-invalid={!!errors.agente}
                                aria-describedby={errors.agente ? "cct-edit-agent-error" : undefined}
                                readOnly={busy}
                            />
                            {fail("cct-edit-agent", errors.agente?.message)}
                        </div>
                        <div>
                            <label htmlFor="cct-edit-physical">Número de cepo físico *</label>
                            <input
                                id="cct-edit-physical"
                                className={styles.control}
                                inputMode="numeric"
                                {...register("cepoFisico", changed)}
                                aria-invalid={!!errors.cepoFisico}
                                aria-describedby={errors.cepoFisico ? "cct-edit-physical-error" : undefined}
                                readOnly={busy}
                            />
                            {fail("cct-edit-physical", errors.cepoFisico?.message)}
                        </div>
                        <div>
                            <label htmlFor="cct-edit-date">Fecha de colocación *</label>
                            <input
                                id="cct-edit-date"
                                className={styles.control}
                                type="datetime-local"
                                max={cctCivilNow()}
                                {...register("fecha", changed)}
                                aria-invalid={!!errors.fecha}
                                aria-describedby={errors.fecha ? "cct-edit-date-error" : undefined}
                                readOnly={busy}
                            />
                            {fail("cct-edit-date", errors.fecha?.message)}
                        </div>
                        <div>
                            <label htmlFor="cct-edit-note">Observaciones</label>
                            <textarea
                                id="cct-edit-note"
                                className={styles.control}
                                maxLength={300}
                                {...register("observaciones", changed)}
                                aria-invalid={!!errors.observaciones}
                                aria-describedby={errors.observaciones ? "cct-edit-note-error" : undefined}
                                readOnly={busy}
                            />
                            {fail("cct-edit-note", errors.observaciones?.message)}
                        </div>
                    </div>
                    <label className={local.check}>
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            required
                            disabled={busy}
                        />
                        Revisé los datos de colocación.
                    </label>
                    <Button type="submit" state={busy || !accepted ? "disabled" : "default"}>
                        {busy ? "Guardando…" : "Guardar cambios de colocación"}
                    </Button>
                </form>
                {error && (
                    <p role="alert" className={styles.error}>
                        {error} Conservamos los datos; actualiza la ficha antes de cambiar la solicitud.
                    </p>
                )}
            </section>
        </PopOver>
    );
}
