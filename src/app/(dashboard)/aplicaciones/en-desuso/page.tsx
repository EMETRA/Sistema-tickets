import Link from "next/link";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export default function RetiredApplication() {
    return (
        <section className={styles.card}>
            <h1>Aplicación en desuso</h1>
            <p>
                Este proceso fue retirado del catálogo institucional. Su
                información histórica se conserva.
            </p>
            <Link href="/aplicaciones">Volver a aplicaciones</Link>
        </section>
    );
}
