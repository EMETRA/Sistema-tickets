"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NewsListView from "./NewsListView/NewsListView";
import NewsFormView from "./NewsFormView/NewsFormView";
import styles from "./COM03.module.scss";

/**
 * COM03 - Comunicación / Noticias.
 * APP_REGISTRY no tiene subrutas, así que la pantalla se elige con parámetros de URL:
 * - (sin parámetros)        → listado
 * - ?vista=crear            → formulario de creación
 * - ?vista=editar&id=<id>   → formulario de edición
 */
function COM03Content() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const vista = searchParams.get("vista");
    const id = searchParams.get("id");

    const goToList = () => router.push(pathname);
    const goToCreate = () => router.push(`${pathname}?vista=crear`);
    const goToEdit = (noticiaId: string) =>
        router.push(`${pathname}?vista=editar&id=${encodeURIComponent(noticiaId)}`);

    const isForm = vista === "crear" || (vista === "editar" && Boolean(id));

    return (
        <div className={styles.content}>
            {isForm ? (
                <NewsFormView noticiaId={vista === "editar" ? id : null} onBack={goToList} />
            ) : (
                <NewsListView onCreate={goToCreate} onEdit={goToEdit} />
            )}
        </div>
    );
}

export default function COM03() {
    return (
        <Suspense fallback={null}>
            <COM03Content />
        </Suspense>
    );
}
