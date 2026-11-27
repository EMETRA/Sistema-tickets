"use client";
import { StateNotice } from "@/components/client/molecules/StateNotice";
import { Button } from "@/components/client/atoms/Button";
import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import styles from "./Home.module.scss";

export function HomeHeading({ description }: { description: string }) {
    const name = useAuthStore((state) => state.user?.nombre)
        ?.trim()
        .split(/\s+/)[0];
    // Fecha local del navegador; vacía al renderizar en el servidor (sin desajuste de hidratación).
    const date = useSyncExternalStore(
        () => () => {},
        () =>
            new Intl.DateTimeFormat("es-GT", {
                timeZone: "America/Guatemala",
                weekday: "long",
                day: "numeric",
                month: "long",
            }).format(new Date()),
        () => "",
    );
    return (
        <header className={styles.heading}>
            <div>
                <span className={styles.eyebrow}>Panel EMETRA</span>
                <h1>{name ? `Hola, ${name}` : "Inicio"}</h1>
                <p>{description}</p>
            </div>
            {date && <span className={styles.date}>{date}</span>}
        </header>
    );
}

export function HomeState({
    loading,
    message,
    onRetry,
    retryLabel = "Reintentar",
}: {
    loading?: boolean;
    message: string;
    onRetry?: () => void;
    retryLabel?: string;
}) {
    if (!loading)
        return (
            <StateNotice
                tone="error"
                title={message}
                helpTopic="inicio"
                actions={onRetry ? <Button onClick={onRetry}>{retryLabel}</Button> : undefined}
            />
        );
    return (
        <div className={styles.state} role="status">
            <p>{message}</p>
        </div>
    );
}
