"use client";

import { useEffect, useState } from "react";

/**
 * Crea una URL temporal (blob:) para mostrar un archivo local y la libera al desmontar
 * o cuando cambia el archivo, para no dejar memoria retenida.
 */
export function useObjectUrl(file: File | null): string | null {
    const [entry, setEntry] = useState<{ file: File; url: string } | null>(null);

    useEffect(() => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        // La URL es un recurso externo: se crea y se libera en el mismo efecto para que
        // funcione con el doble montaje de StrictMode. Por eso se guarda en estado aquí.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEntry({ file, url });
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // Si el archivo cambió y el efecto aún no corre, no se devuelve la URL anterior.
    return file && entry?.file === file ? entry.url : null;
}
