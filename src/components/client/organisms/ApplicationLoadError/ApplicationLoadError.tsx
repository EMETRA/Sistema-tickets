"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/client/atoms/Button";
import { useAuthStore } from "@/store/useAuthStore";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export function ApplicationLoadError({
    onRetry,
}: {
    onRetry: () => void | Promise<void>;
}) {
    const [busy, setBusy] = useState(false);
    async function retry() {
        setBusy(true);
        try {
            await onRetry();
        } catch {
            /* El estado del catálogo conserva el error de consulta. */
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className={styles.card} role="alert">
            <h2>No se pudo abrir la aplicación</h2>
            <p>
                Intenta nuevamente. Si tu sesión venció, vuelve a iniciar
                sesión.
            </p>
            <div className={styles.actions}>
                <Button
                    state={busy ? "loading" : "default"}
                    onClick={() => void retry()}
                >
                    Reintentar aplicación
                </Button>
                <Link className={styles.link} href="/aplicaciones">
                    Volver a aplicaciones
                </Link>
                <Button
                    variant="outlined"
                    onClick={() => useAuthStore.getState().logout()}
                >
                    Volver a iniciar sesión
                </Button>
            </div>
        </section>
    );
}
