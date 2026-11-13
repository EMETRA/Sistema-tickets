"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformCommand } from "@/platform/client";
import { cctCivilNow, type CctCepo } from "@/platform/cct";
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
    const [form, setForm] = useState({
        crucero: d.CRUCERO || "",
        tipoAgente: d.TIPO_AGENTE || "",
        agente: d.AGENTE || "",
        delegacion: d.DELEGACION || "",
        motivo: d.MOTIVO || "",
        cepoFisico: d.CEPO_FISICO || "",
        fecha: d.FECHA || "",
        observaciones: d.OBSERVACIONES || "",
    });
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
    function set(key: keyof typeof form, value: string) {
        setForm((f) => ({ ...f, [key]: value }));
        setAccepted(false);
    }
    async function submit(e: React.FormEvent) {
        e.preventDefault();
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
    }
    return (
        <section className={local.review} aria-label="Editar colocación">
            <div className={styles.toolbar}>
                <h3>Editar colocación · Aviso {d.AVISO}</h3>
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    state={busy ? "disabled" : "default"}
                >
                    Cancelar edición
                </Button>
            </div>
            <p className={local.hint}>
                Revisa lugar, motivo, agente y fecha. Se conserva el número del
                aviso y su vehículo. La edición queda registrada en la
                auditoría.
            </p>
            <form onSubmit={submit}>
                <div className={local.form}>
                    {(
                        [
                            ["crucero", "cruceros", "Crucero"],
                            ["motivo", "motivos", "Motivo"],
                            ["delegacion", "delegaciones", "Delegación"],
                            ["tipoAgente", "agentes", "Tipo de agente"],
                        ] as const
                    ).map(([key, kind, label]) => (
                        <CctPicker
                            key={key}
                            kind={kind}
                            label={label}
                            value={form[key]}
                            onChange={(v) => set(key, v)}
                            disabled={busy}
                        />
                    ))}
                    <div>
                        <label htmlFor="cct-edit-agent">
                            Chapa del agente *
                        </label>
                        <input
                            id="cct-edit-agent"
                            className={styles.control}
                            value={form.agente}
                            onChange={(e) => set("agente", e.target.value)}
                            required
                            pattern="[1-9][0-9]{0,17}"
                            disabled={busy}
                        />
                    </div>
                    <div>
                        <label htmlFor="cct-edit-physical">
                            Número de cepo físico *
                        </label>
                        <input
                            id="cct-edit-physical"
                            className={styles.control}
                            value={form.cepoFisico}
                            onChange={(e) => set("cepoFisico", e.target.value)}
                            required
                            pattern="[1-9][0-9]{0,17}"
                            disabled={busy}
                        />
                    </div>
                    <div>
                        <label htmlFor="cct-edit-date">
                            Fecha de colocación *
                        </label>
                        <input
                            id="cct-edit-date"
                            className={styles.control}
                            type="datetime-local"
                            value={form.fecha}
                            max={cctCivilNow()}
                            onChange={(e) => set("fecha", e.target.value)}
                            required
                            disabled={busy}
                        />
                    </div>
                    <div>
                        <label htmlFor="cct-edit-note">Observaciones</label>
                        <textarea
                            id="cct-edit-note"
                            className={styles.control}
                            value={form.observaciones}
                            maxLength={300}
                            onChange={(e) =>
                                set("observaciones", e.target.value)
                            }
                            disabled={busy}
                        />
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
                <Button
                    type="submit"
                    state={busy || !accepted ? "disabled" : "default"}
                >
                    {busy ? "Guardando…" : "Guardar cambios de colocación"}
                </Button>
            </form>
            {error && (
                <p role="alert" className={styles.error}>
                    {error} Conservamos los datos; actualiza la ficha antes de
                    cambiar la solicitud.
                </p>
            )}
        </section>
    );
}
