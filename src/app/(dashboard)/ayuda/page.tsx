"use client";
import Link from "next/link";
import { usePlatform } from "@/platform/context";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export default function HelpPage() {
    const { data } = usePlatform();
    return (
        <section className={styles.page}>
            <article className={styles.card}>
                <h2>Solicitar ayuda a Informática</h2>
                <p className={styles.muted}>
                    Describe lo que necesitas, selecciona la categoría y adjunta
                    una captura si ayuda a explicar el problema. Podrás
                    consultar las respuestas y el historial de atención en tus
                    tickets.
                </p>
                <div className={styles.actions}>
                    <Link className={styles.link} href="/tickets-creation">
                        Crear ticket
                    </Link>
                    <Link className={styles.link} href="/mis-tickets">
                        Dar seguimiento a mis tickets
                    </Link>
                </div>
            </article>
            <article className={styles.card}>
                <h2>Tu espacio de trabajo</h2>
                <p className={styles.muted}>
                    Las aplicaciones y herramientas disponibles dependen de los
                    permisos de tu perfil. Si necesitas un acceso adicional,
                    contacta a la jefatura de tu unidad.
                </p>
                <div className={styles.actions}>
                    <Link className={styles.link} href="/aplicaciones">
                        Ver aplicaciones autorizadas
                    </Link>
                    {data && (
                        <Link
                            className={styles.link}
                            href="/espacio/calendario"
                        >
                            Ver calendario de mi equipo
                        </Link>
                    )}
                </div>
            </article>
        </section>
    );
}
