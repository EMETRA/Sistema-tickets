"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/components/client/atoms/Button";
import { InventoryWorkspace } from "@/components/client/organisms/ResourceWorkspace/InventoryWorkspace";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export function InventoryLinkDialog({
    onClose,
    onSaved,
}: {
    onClose: () => void;
    onSaved: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const element = dialog.current;
        element?.showModal();
        return () => element?.close();
    }, []);
    return (
        <dialog
            ref={dialog}
            className={styles.dialog} aria-label="Vincular un bien a la red"
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
        >
            <div className={styles.dialogBody}>
                <div className={styles.toolbar}>
                    <div>
                        <h2>Vincular un bien a la red</h2>
                        <p className={styles.muted}>
                            Selecciona el bien y completa la ubicación y sus
                            puertos. La tarjeta de responsabilidad conserva su
                            asignación oficial.
                        </p>
                    </div>
                    <Button variant="outlined" onClick={onClose}>
                        Cerrar búsqueda de bienes
                    </Button>
                </div>
                <InventoryWorkspace type="dispositivos" onSaved={onSaved} />
            </div>
        </dialog>
    );
}
