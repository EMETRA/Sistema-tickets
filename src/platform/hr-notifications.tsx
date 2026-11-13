"use client";
import Link from "next/link";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { platformFetch, PlatformError } from "./client";
import { hrDate, HR_STATES, type HrNotice } from "./hr";
import { Button } from "@/components/client/atoms/Button";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "@/views/Platform/HrWorkspace.module.scss";
type Inbox = { habilitado: boolean; items: HrNotice[]; pendientes: number };
const Context = createContext({
    data: null as Inbox | null,
    error: "",
    refresh: async () => {},
});
export function HrNotificationsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = useAuthStore((s) => s.token),
        hydrated = useAuthStore((s) => s.isHydrated);
    const [data, setData] = useState<Inbox | null>(null),
        [error, setError] = useState("");
    const [blocked, setBlocked] = useState(false),
        [failures, setFailures] = useState(0);
    const generation = useRef(0);
    const refresh = useCallback(async () => {
        const version = ++generation.current;
        if (!token || !hydrated) {
            setData(null);
            return;
        }
        try {
            const r = await platformFetch<Inbox>("/hr/inbox");
            if (version !== generation.current) return;
            if (!Array.isArray(r.items) || typeof r.pendientes !== "number")
                throw Error("No se pudieron leer las notificaciones de RRHH.");
            setData(r);
            setError("");
            setBlocked(false);
            setFailures(0);
        } catch (e) {
            if (version !== generation.current) return;
            const denied =
                e instanceof PlatformError &&
                ([401, 403].includes(e.status) ||
                    e.code === "FEATURE_DISABLED");
            if (denied) setData(null);
            setBlocked(denied);
            setFailures((v) => v + 1);
            setError(
                e instanceof PlatformError && e.code === "FEATURE_DISABLED"
                    ? ""
                    : (e instanceof Error
                          ? e.message
                          : "No se pudieron leer las notificaciones.") +
                          (e instanceof PlatformError && e.reference
                              ? " Referencia: " + e.reference
                              : ""),
            );
        }
    }, [token, hydrated]);
    useEffect(() => {
        setData(null);
        setBlocked(false);
        setFailures(0);
        setError("");
        void refresh();
        return () => {
            generation.current++;
        };
    }, [refresh]);
    useEffect(() => {
        if (!token || !hydrated || blocked) return;
        const update = () => {
            if (document.visibilityState === "visible") void refresh();
        };
        const timer = error
            ? setTimeout(
                  update,
                  Math.min(
                      300000,
                      30000 * 2 ** Math.min(4, Math.max(0, failures - 1)),
                  ),
              )
            : data?.habilitado
              ? setInterval(update, 60000)
              : null;
        window.addEventListener("focus", update);
        window.addEventListener("tickets-hr-updated", update);
        return () => {
            if (timer !== null) {
                clearInterval(timer);
                clearTimeout(timer);
            }
            window.removeEventListener("focus", update);
            window.removeEventListener("tickets-hr-updated", update);
        };
    }, [token, hydrated, data?.habilitado, error, failures, blocked, refresh]);
    return (
        <Context.Provider value={{ data, error, refresh }}>
            {children}
        </Context.Provider>
    );
}
export const useHrNotifications = () => useContext(Context);
export function HrMandatoryNotice() {
    const { data } = useHrNotifications();
    if (!data?.pendientes) return null;
    return (
        <aside
            className={local.notice}
            aria-label="Actualización obligatoria de RRHH"
        >
            <div>
                <strong>Actualización de datos obligatoria</strong>
                <span>
                    {data.pendientes === 1
                        ? "Tienes una campaña pendiente."
                        : "Tienes " +
                          data.pendientes +
                          " campañas pendientes."}{" "}
                    Revisa sus campos y fecha de cierre.
                </span>
            </div>
            <Link href="/mi-perfil">Ir a mi perfil</Link>
        </aside>
    );
}
export function HrNotificationsPage() {
    const { data, error, refresh } = useHrNotifications();
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h1>Notificaciones</h1>
                <Button variant="outlined" onClick={() => void refresh()}>
                    Actualizar notificaciones
                </Button>
            </div>
            <section className={styles.card}>
                <h2>Actualización de datos de RRHH</h2>
                {error && (
                    <p role="alert" className={styles.error}>
                        {error}
                    </p>
                )}
                {!data && !error && (
                    <p role="status">Consultando notificaciones…</p>
                )}
                {data && !data.items.length && (
                    <p>No hay campañas de actualización para tu cuenta.</p>
                )}
                {data?.items.map((c) => (
                    <article key={c.id} className={local.campaign}>
                        <div>
                            <h3>{c.nombre}</h3>
                            <p>{c.descripcion}</p>
                            <p>
                                <strong>
                                    {c.ventana === "CERRADA"
                                        ? "Campaña cerrada · " +
                                          HR_STATES[c.estado]
                                        : c.ventana === "PROGRAMADA"
                                          ? "Programada"
                                          : c.pendiente
                                            ? "Obligatoria · Pendiente"
                                            : HR_STATES[c.estado]}
                                </strong>{" "}
                                ·{" "}
                                {c.ventana === "PROGRAMADA"
                                    ? "Apertura: " + hrDate(c.inicio)
                                    : "Cierre: " + hrDate(c.fin)}
                            </p>
                        </div>
                        <Link
                            href={
                                "/mi-perfil?campana=" + encodeURIComponent(c.id)
                            }
                        >
                            Ver actualización
                        </Link>
                    </article>
                ))}
            </section>
            <section className={styles.card}>
                <h2>Seguimiento de tickets</h2>
                <Link href="/mis-tickets">
                    Ver respuestas y actualizaciones de mis tickets
                </Link>
            </section>
        </div>
    );
}

export function HrNotificationBadge() {
    const { data } = useHrNotifications();
    return data?.pendientes ? (
        <span
            className={local.badge}
            aria-label={
                data.pendientes + " actualizaciones obligatorias pendientes"
            }
        >
            {data.pendientes > 99 ? "99+" : data.pendientes}
        </span>
    ) : null;
}
