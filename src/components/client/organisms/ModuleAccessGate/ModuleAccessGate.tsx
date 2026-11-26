"use client";
import { StateNotice } from "@/components/client/molecules/StateNotice";
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
            <StateNotice
                tone="error"
                title="Acceso pendiente de comprobar"
                description={check.error}
                helpTopic="acceso"
                actions={
                    <Button
                        onClick={() => {
                            setCheck(null);
                            setRevision((v) => v + 1);
                        }}
                    >
                        Reintentar acceso
                    </Button>
                }
            />
        );
    if (!check.data?.allowed)
        return (
            <StateNotice
                tone="forbidden"
                title="Sin acceso a este formulario"
                description="Tu cuenta no tiene los permisos necesarios para realizar este proceso. Puedes solicitar acceso a Informática."
                actions={
                    <>
                        <Link href="/espacio/solicitudes">Solicitar acceso</Link>
                        <Link href="/aplicaciones">Volver a aplicaciones</Link>
                    </>
                }
            />
        );
    return (
        <Context.Provider value={check.data.actions}>
            {children}
        </Context.Provider>
    );
}
