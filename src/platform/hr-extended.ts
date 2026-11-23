export type HrCollection = {
    declaracion: "REGISTRADO" | "NINGUNO" | "";
    registros: Record<string, string>[];
};
type Column = {
    key: string;
    label: string;
    max?: number;
    required?: boolean;
    type?: "date" | "number";
    options?: Record<string, string>;
};
export const HR_COLLECTIONS: Record<
    string,
    { label: string; none: string; add: string; columns: Column[] }
> = {
    RH_FAMILIARES: {
        label: "Padres, hijos y cónyuge",
        none: "No registro familiares",
        add: "Agregar familiar",
        columns: [
            {
                key: "parentesco",
                label: "Parentesco",
                required: true,
                options: {
                    PADRE: "Padre",
                    MADRE: "Madre",
                    HIJO: "Hijo",
                    HIJA: "Hija",
                    CONYUGE: "Cónyuge",
                },
            },
            {
                key: "nombre",
                label: "Nombre completo",
                required: true,
                max: 150,
            },
            { key: "nacimiento", label: "Fecha de nacimiento", type: "date" },
            { key: "telefono", label: "Teléfono", max: 30 },
        ],
    },
    RH_ESTUDIOS: {
        label: "Formación académica",
        none: "No registro formación académica",
        add: "Agregar estudio",
        columns: [
            {
                key: "nivel",
                label: "Nivel académico",
                required: true,
                options: {
                    PRIMARIA: "Primaria",
                    BASICOS: "Básicos",
                    DIVERSIFICADO: "Diversificado",
                    TECNICO: "Técnico",
                    PROFESORADO: "Profesorado",
                    LICENCIATURA: "Licenciatura",
                    MAESTRIA: "Maestría",
                    DOCTORADO: "Doctorado",
                    OTRO: "Otro",
                },
            },
            {
                key: "estado",
                label: "Estado del estudio",
                required: true,
                options: {
                    EN_CURSO: "En curso",
                    INCOMPLETO: "Incompleto",
                    CIERRE_PENSUM: "Cierre de pénsum",
                    GRADUADO: "Graduado / completado",
                },
            },
            { key: "carrera", label: "Carrera o especialidad", max: 150 },
            { key: "institucion", label: "Institución", max: 150 },
            {
                key: "anio",
                label: "Año alcanzado o de finalización",
                type: "number",
            },
        ],
    },
    RH_ALERGIAS: {
        label: "Alergias a medicamentos",
        none: "No conozco alergias a medicamentos",
        add: "Agregar alergia",
        columns: [
            {
                key: "medicamento",
                label: "Medicamento o sustancia",
                required: true,
                max: 150,
            },
            { key: "reaccion", label: "Reacción conocida", max: 300 },
            { key: "observacion", label: "Observación", max: 300 },
        ],
    },
};
export function hrCollection(
    raw: string | null | undefined,
): HrCollection | null {
    if (!raw) return null;
    try {
        const d = JSON.parse(raw);
        return d &&
            ["REGISTRADO", "NINGUNO", ""].includes(d.declaracion) &&
            Array.isArray(d.registros)
            ? d
            : null;
    } catch {
        return null;
    }
}
export function hrCollectionText(
    code: string,
    raw: string | null | undefined,
): string | null {
    const config = HR_COLLECTIONS[code];
    if (!config) return raw ?? null;
    const data = hrCollection(raw);
    if (!data) return "Sin declaración registrada";
    if (data.declaracion === "NINGUNO") return config.none;
    return data.registros
        .map((row) =>
            config.columns
                .filter((c) => row[c.key])
                .map(
                    (c) =>
                        c.label +
                        ": " +
                        (c.options?.[row[c.key]] || row[c.key]),
                )
                .join(" · "),
        )
        .join("\n");
}
