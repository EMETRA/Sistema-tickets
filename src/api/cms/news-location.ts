export function newsLocationInput(value: {
    ubicacion?: string;
    latitud?: string;
    longitud?: string;
}) {
    const parse = (text: string | undefined, limit: number) => {
        if (text === undefined) return undefined;
        const v = text.trim();
        if (!v) return null;
        if (
            !/^-?\d+(\.\d+)?$/.test(v) ||
            !Number.isFinite(Number(v)) ||
            Math.abs(Number(v)) > limit
        )
            throw new Error(
                "Revisa latitud (-90 a 90) y longitud (-180 a 180), usando punto decimal.",
            );
        return Number(v);
    };
    const latitud = parse(value.latitud, 90),
        longitud = parse(value.longitud, 180);
    if ((latitud == null) !== (longitud == null))
        throw new Error("Ingresa ambas coordenadas o deja ambas vacías.");
    if ((value.ubicacion?.trim().length || 0) > 350)
        throw new Error(
            "La referencia de ubicación admite hasta 350 caracteres.",
        );
    return {
        ...(value.ubicacion === undefined
            ? {}
            : { ubicacion: value.ubicacion.trim() || null }),
        ...(latitud === undefined ? {} : { latitud }),
        ...(longitud === undefined ? {} : { longitud }),
    };
}
