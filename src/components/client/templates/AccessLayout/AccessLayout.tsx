import Link from "next/link";
import { Icon } from "../../atoms/Icon";
import styles from "./AccessLayout.module.scss";

export function AccessLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className={styles.layout}>
            <section
                className={styles.introduction}
                aria-label="Sistema Tickets EMETRA"
            >
                <Link href="/login" className={styles.brand}>
                    <strong>EMETRA</strong>
                    <span>SISTEMA TICKETS</span>
                </Link>
                <div className={styles.message}>
                    <span className={styles.eyebrow}>Tu espacio de trabajo</span>
                    <h1>Tus solicitudes, aplicaciones y actividades en un lugar.</h1>
                    <p>
                        Accede con tu cuenta institucional. Verás los servicios y tareas que
                        correspondan a tus permisos.
                    </p>
                    <ul>
                        {[
                            ["ticket-solid", "Solicitudes"],
                            ["table-cells-large-solid", "Aplicaciones"],
                            ["calendar-regular", "Actividades"],
                        ].map(([icon, label]) => (
                            <li key={label}>
                                <Icon name={icon} color="#536ca1" size={20} />
                                <span>{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className={styles.footer}>
                    Dirección de Informática · Municipalidad de Guatemala
                </p>
            </section>
            <section className={styles.formRegion} aria-label="Acceso institucional">
                <div className={styles.formContent}>{children}</div>
            </section>
        </main>
    );
}
