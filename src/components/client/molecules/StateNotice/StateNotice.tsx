"use client";
import type { ReactNode } from "react";
import { useCreateTicketDialog } from "@/store/useCreateTicketDialog";
import styles from "./StateNotice.module.scss";

export type NoticeTone = "error" | "warning" | "info" | "success" | "forbidden" | "empty";

const GLYPH: Record<NoticeTone, string> = {
    error: "M12 8v5m0 3h.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z",
    warning:
        "M12 8v5m0 3h.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z",
    info: "M12 11v6m0-10h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    success: "m5 12.5 4.5 4.5L19 7.5",
    forbidden: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5Z",
    empty: "M4 7h16M4 12h10M4 17h7",
};

/**
 * Aviso de estado común (error, sin acceso, vacío, éxito). Explica qué pasó,
 * qué puede hacer la persona y, si persiste, cómo pedir ayuda a Informática.
 */
export function StateNotice({
    tone = "info",
    title,
    description,
    children,
    actions,
    reference,
    helpTopic,
    compact = false,
}: {
    tone?: NoticeTone;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    actions?: ReactNode;
    /** Referencia técnica para soporte (se muestra discreta y se puede copiar). */
    reference?: string;
    /** Si se indica, ofrece reportar el problema a Informática con un ticket. */
    helpTopic?: string;
    compact?: boolean;
}) {
    const showCreate = useCreateTicketDialog((s) => s.show);
    const alert = tone === "error" || tone === "forbidden" || tone === "warning";
    return (
        <section
            className={styles.notice}
            data-tone={tone}
            data-compact={compact || undefined}
            role={alert ? "alert" : "status"}
        >
            <span className={styles.icon} aria-hidden="true">
                <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d={GLYPH[tone]} />
                </svg>
            </span>
            <div className={styles.body}>
                <h2>{title}</h2>
                {description && <div className={styles.description}>{description}</div>}
                {children}
                {actions && <div className={styles.actions}>{actions}</div>}
                {(helpTopic || reference) && (
                    <p className={styles.help}>
                        {helpTopic && (
                            <>
                                ¿Sigue sin funcionar?{" "}
                                <button type="button" onClick={showCreate}>
                                    Avísale a Informática
                                </button>
                                {reference ? " · " : ""}
                            </>
                        )}
                        {reference && (
                            <span>
                                Referencia: <code>{reference}</code>
                            </span>
                        )}
                    </p>
                )}
            </div>
        </section>
    );
}
export default StateNotice;
