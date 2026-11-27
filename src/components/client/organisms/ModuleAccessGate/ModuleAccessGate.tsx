"use client";
import { StateNotice } from "@/components/client/molecules/StateNotice";
import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { platformKey } from "@/platform/query";
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
export function ModuleAccessGate({ moduleId, children }: { moduleId: string; children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token),
        hydrated = useAuthStore((s) => s.isHydrated);
    // El acceso depende de la sesión: la clave incluye el token para no reutilizar el de otra cuenta.
    const access = useQuery({
        queryKey: [...platformKey("/module-access/" + moduleId), token],
        enabled: !!token && hydrated,
        retry: false,
        queryFn: async ({ signal }) => {
            const data = await platformFetch<Access>("/module-access/" + encodeURIComponent(moduleId), {
                signal,
            });
            if (
                !data ||
                data.moduloId !== moduleId ||
                typeof data.allowed !== "boolean" ||
                !data.actions ||
                ["LEER", "INSERTAR", "EDITAR", "ELIMINAR"].some(
                    (action) => typeof data.actions[action as keyof Actions] !== "boolean",
                )
            )
                throw new Error("Respuesta de acceso inválida");
            return data;
        },
    });
    const check = access.data
        ? { data: access.data }
        : access.error
          ? { data: undefined, error: "No se pudo comprobar tu acceso al formulario." }
          : null;
    if (!hydrated || !check)
        return (
            <p role="status" className={styles.card}>
                Comprobando acceso al formulario…
            </p>
        );
    if ("error" in check && check.error)
        return (
            <StateNotice
                tone="error"
                title="Acceso pendiente de comprobar"
                description={check.error}
                helpTopic="acceso"
                actions={<Button onClick={() => void access.refetch()}>Reintentar acceso</Button>}
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
    return <Context.Provider value={check.data.actions}>{children}</Context.Provider>;
}
