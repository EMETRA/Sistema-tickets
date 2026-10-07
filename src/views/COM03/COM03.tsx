"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetPermisosNoticias } from "@/api/hooks";
import { Text } from "@/components/client/atoms/Text";
import { Title } from "@/components/client/atoms/Title";
import { NewsResultCard } from "@/components/client/organisms/NewsResultCard";
import NewsListView from "./NewsListView/NewsListView";
import NewsFormView from "./NewsFormView/NewsFormView";
import { permisosParaUI } from "./utils/permisos";
import styles from "./COM03.module.scss";

/**
 * Pantallas sin permiso. TODO [COM03-FLUJO]: textos y diseño propuestos (no están en el Figma).
 * El mensaje nombra el permiso que falta, como el 403 del backend (PERMISOS_PANEL.md, sección 6).
 */
const SIN_PERMISO = {
    leer: {
        title: "No tienes acceso a las noticias",
        description: "Pide a un administrador el permiso VIVI_NOTICIAS_LEER para ver las noticias.",
    },
    editar: {
        title: "No puedes crear ni editar noticias",
        description: "Pide a un administrador el permiso VIVI_NOTICIAS_EDITAR.",
    },
};

/**
 * COM03 - Comunicación / Noticias.
 * APP_REGISTRY no tiene subrutas, así que la pantalla se elige con parámetros de URL:
 * - (sin parámetros)        → listado
 * - ?vista=crear            → formulario de creación
 * - ?vista=editar&id=<id>   → formulario de edición
 *
 * Los botones se muestran según `usuario.permisos` (README "Noticias CMS", sección 2). Ocultarlos no
 * autoriza: el backend verifica cada operación. Si los permisos no se pueden consultar, se permite reintentar la consulta.
 */
function COM03Content() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: permisos, loading: loadingPermisos, error: errorPermisos, refetch: refetchPermisos } = useGetPermisosNoticias();

    const vista = searchParams.get("vista");
    const id = searchParams.get("id");

    const goToList = () => router.push(pathname);
    const goToCreate = () => router.push(`${pathname}?vista=crear`);
    const goToEdit = (noticiaId: string) =>
        router.push(`${pathname}?vista=editar&id=${encodeURIComponent(noticiaId)}`);

    const isForm = vista === "crear" || (vista === "editar" && Boolean(id));

    // Se espera a los permisos para no mostrar botones que luego desaparecen.
    if (loadingPermisos) {
        return (
            <div className={styles.content}>
                <Text variant="caption" className={styles.status}>Cargando noticias...</Text>
            </div>
        );
    }

    if (errorPermisos) return <div className={styles.content}><NewsResultCard status="error" title="No se pudieron consultar los permisos" description="Intenta consultar de nuevo para continuar." primaryAction={{ label: 'Reintentar', onClick: () => void refetchPermisos() }} /></div>;
    const { puedeLeer, puedeEditar, puedePublicar } = permisosParaUI(permisos);

    const sinPermiso = !puedeLeer
        ? { ...SIN_PERMISO.leer, action: { label: "Ir al inicio", onClick: () => router.push("/home") } }
        : isForm && !puedeEditar
            ? { ...SIN_PERMISO.editar, action: { label: "Ver listado de noticias", onClick: goToList } }
            : null;

    if (sinPermiso) {
        return (
            <div className={styles.content}>
                <Title variant="mid" tag="h1" className={styles.heading}>Comunicación</Title>
                <NewsResultCard
                    status="error"
                    title={sinPermiso.title}
                    description={sinPermiso.description}
                    primaryAction={sinPermiso.action}
                />
            </div>
        );
    }

    return (
        <div className={styles.content}>
            {isForm ? (
                <NewsFormView
                    noticiaId={vista === "editar" ? id : null}
                    onBack={goToList}
                    canPublish={puedePublicar}
                />
            ) : (
                <NewsListView onCreate={goToCreate} onEdit={goToEdit} canEdit={puedeEditar} />
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
