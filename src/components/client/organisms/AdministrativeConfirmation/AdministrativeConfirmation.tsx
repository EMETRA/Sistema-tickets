"use client";
import { useEffect, useRef, useState } from "react";
import {
    registerAdministrativeConfirmation,
    type AdministrativeChange,
} from "@/api/administrative-confirmation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../../atoms/Button";
import styles from "./AdministrativeConfirmation.module.scss";

type Pending = {
  change: AdministrativeChange;
  resolve: (confirmed: boolean) => void;
};
export function AdministrativeConfirmation() {
    const dialog = useRef<HTMLDialogElement>(null);
    const queue = useRef<Pending[]>([]);
    const active = useRef<Pending | null>(null);
    const [pending, setPending] = useState<Pending | null>(null);
    const [step, setStep] = useState(1);
    const [checked, setChecked] = useState(false);
    const userName = useAuthStore(
        (state) => state.user?.nombre || "Administrador",
    );

    useEffect(() => {
        const pendingQueue = queue.current;
        const unregister = registerAdministrativeConfirmation(
            (change) =>
                new Promise<boolean>((resolve) => {
                    const item = { change, resolve };
                    if (active.current) pendingQueue.push(item);
                    else {
                        active.current = item;
                        setPending(item);
                        setStep(1);
                        setChecked(false);
                    }
                }),
        );
        return () => {
            unregister();
            active.current?.resolve(false);
            active.current = null;
            pendingQueue.splice(0).forEach((item) => item.resolve(false));
        };
    }, []);

    useEffect(() => {
        if (pending && !dialog.current?.open) dialog.current?.showModal();
        else if (!pending && dialog.current?.open) dialog.current.close();
    }, [pending]);

    const finish = (confirmed: boolean) => {
        const current = active.current;
        if (!current) return;
        active.current = null;
        current.resolve(confirmed);
        const next = queue.current.shift() || null;
        active.current = next;
        setPending(next);
        setStep(1);
        setChecked(false);
    };
    return (
        <dialog
            ref={dialog}
            className={styles.dialog}
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-description"
            onCancel={(event) => {
                event.preventDefault();
                finish(false);
            }}
        >
            <div className={styles.progress} aria-label={`Confirmación ${step} de 2`}>
                <span className={styles.current}>1 · Revisar</span>
                <span className={step === 2 ? styles.current : undefined}>
                    2 · Confirmar
                </span>
            </div>
            <h2 id="admin-confirm-title">
                {step === 1 ? "Revisa el cambio" : "Confirma y aplica"}
            </h2>
            <p id="admin-confirm-description">
                {step === 1
                    ? "Comprueba la acción antes de continuar. Todavía no se ha enviado la solicitud."
                    : "Esta es la segunda confirmación. La solicitud se enviará al confirmar este paso."}
            </p>
            <div className={styles.summary}>
                <strong>{pending?.change.label}</strong>
                {pending?.change.detail && <span>{pending.change.detail}</span>}
                <small>Administrador: {userName}</small>
            </div>
            {step === 2 && (
                <label className={styles.check}>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                    />
                    He revisado la acción y quiero aplicarla.
                </label>
            )}
            <div className={styles.actions}>
                <Button type="button" variant="outlined" onClick={() => finish(false)}>
                    Cancelar
                </Button>
                {step === 1 ? (
                    <Button type="button" onClick={() => setStep(2)}>
                        Confirmar revisión · 1 de 2
                    </Button>
                ) : (
                    <Button
                        type="button"
                        state={checked ? "default" : "disabled"}
                        onClick={() => {
                            if (checked) finish(true);
                        }}
                    >
                        Confirmar y aplicar · 2 de 2
                    </Button>
                )}
            </div>
        </dialog>
    );
}
