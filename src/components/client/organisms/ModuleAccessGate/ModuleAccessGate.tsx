"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { platformFetch } from "@/platform/client";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/client/atoms/Button";
import Link from "next/link";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Actions = {
    LEER: boolean;
    INSERTAR: boolean;
    EDITAR: boolean;
    ELIMINAR: boolean;
};
type Access = { moduloId: string; allowed: boolean; actions: Actions };
const Context = createContext<Actions>({
    LEER: false,
    INSERTAR: false,
    EDITAR: false,
    ELIMINAR: false,
});
export const useModuleActions = () => useContext(Context);
export function ModuleAccessGate({
    moduleId,
    children,
}: {
    moduleId: string;
    children: React.ReactNode;
}) {
    const token = useAuthStore((s) => s.token),
        hydrated = useAuthStore((s) => s.isHydrated);
    const [revision, setRevision] = useState(0);
    const [check, setCheck] = useState<{
        token: string;
        id: string;
        data?: Access;
        error?: string;
    } | null>(null);
    useEffect(() => {
        if (!token || !hydrated) return;
        const controller = new AbortController();
        platformFetch<Access>(
            "/module-access/" + encodeURIComponent(moduleId),
            {
                signal: controller.signal,
            },
        )
            .then((data) => {
                if (
                    !data ||
                    data.moduloId !== moduleId ||
                    typeof data.allowed !== "boolean" ||
                    !data.actions ||
                    ["LEER", "INSERTAR", "EDITAR", "ELIMINAR"].some(
                        (action) =>
                            typeof data.actions[action as keyof Actions] !==
                            "boolean",
                    )
                )
                    throw new Error("Respuesta de acceso inválida");
                if (!controller.signal.aborted)
                    setCheck({ token, id: moduleId, data });
            })
            .catch(() => {
                if (!controller.signal.aborted)
                    setCheck({
                        token,
                        id: moduleId,
                        error: "No se pudo comprobar tu acceso al formulario.",
                    });
            });
        return () => controller.abort();
    }, [moduleId, token, hydrated, revision]);
    if (!hydrated || !check || check.token !== token || check.id !== moduleId)
        return (
            <p role="status" className={styles.card}>
                Comprobando acceso al formulario…
            </p>
        );
    if (check.error)
        return (
            <section role="alert" className={styles.card}>
                <h2>Acceso pendiente de comprobar</h2>
                <p>{check.error}</p>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setCheck(null);
                        setRevision((v) => v + 1);
                    }}
                >
                    Reintentar acceso
                </Button>
            </section>
        );
    if (!check.data?.allowed)
        return (
            <section role="alert" className={styles.card}>
                <h2>Sin acceso a este formulario</h2>
                <p>
                    Tu cuenta no tiene los permisos necesarios para realizar
                    este proceso. Puedes solicitar acceso a Informática.
                </p>
                <Link href="/aplicaciones">Volver a aplicaciones</Link>
            </section>
        );
    return (
        <Context.Provider value={check.data.actions}>
            {children}
        </Context.Provider>
    );
}
