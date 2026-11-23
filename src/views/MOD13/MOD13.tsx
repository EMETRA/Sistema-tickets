"use client";
import Link from "next/link";
import styles from "./MOD13.module.scss";

export default function MOD13() {
    return <section className={styles.wrapper}>
        <h2>Búsqueda de remisiones por nombre</h2>
        <p>Esta consulta todavía no está disponible. Para consultar los datos de un vehículo, utiliza su uso y placa en la consulta SAT.</p>
        <Link href="/home/recaudacion/consultas/consulta-vehiculos">Ir a consulta de vehículos SAT →</Link>
    </section>;
}
