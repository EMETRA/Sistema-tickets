"use client";
import { useEffect, useRef, useState } from "react";
import {
    WORKSPACE_VIEWS,
    type WorkspaceViewSelection,
} from "@/platform/presentation";
import styles from "./WorkspaceViewSwitcher.module.scss";

export function WorkspaceViewSwitcher({
    open,
    mode,
    onClose,
    onApply,
}: {
  open: boolean;
  mode: WorkspaceViewSelection;
  onClose: () => void;
  onApply: (mode: WorkspaceViewSelection) => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [choice, setChoice] = useState(mode);
    useEffect(() => {
        if (open) dialog.current?.showModal();
        else dialog.current?.close();
    }, [open]);
    return (
        <dialog
            ref={dialog}
            className={styles.dialog}
            aria-labelledby="workspace-view-title"
            aria-describedby="workspace-view-description"
            onCancel={onClose}
            onClose={onClose}
        >
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onApply(choice);
                    onClose();
                }}
            >
                <header>
                    <span>Presentación del espacio de trabajo</span>
                    <h2 id="workspace-view-title">Cambiar vista</h2>
                </header>
                <p id="workspace-view-description">
                    Cambia la portada y la navegación para presentaciones y pruebas
                    visuales. Los datos y permisos siguen siendo los de tu cuenta.
                </p>
                <label htmlFor="workspace-view-choice">
                    Vista del espacio de trabajo
                </label>
                <select
                    id="workspace-view-choice"
                    value={choice}
                    onChange={(event) =>
                        setChoice(event.target.value as WorkspaceViewSelection)
                    }
                >
                    <option value="ACTUAL">Mi vista actual</option>
                    {WORKSPACE_VIEWS.map((view) => (
                        <option key={view.id} value={view.id}>
                            {view.label}
                        </option>
                    ))}
                </select>
                <footer>
                    <button type="button" onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.primary}>
                        Aplicar vista
                    </button>
                </footer>
            </form>
        </dialog>
    );
}
