"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import styles from "./Home.module.scss";

export function HomeHeading({ description }: { description: string }) {
  const name = useAuthStore((state) => state.user?.nombre)
    ?.trim()
    .split(/\s+/)[0];
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(
      new Intl.DateTimeFormat("es-GT", {
        timeZone: "America/Guatemala",
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    );
  }, []);
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
  return (
    <div className={styles.state} role={loading ? "status" : "alert"}>
      <p>{message}</p>
      {onRetry && !loading && (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
