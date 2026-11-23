"use client";
import { Button } from "@/components/client/atoms/Button";
import { HR_COLLECTIONS, hrCollection } from "@/platform/hr-extended";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./HrWorkspace.module.scss";
export function HrCollectionView({
    code,
    value,
}: {
    code: string;
    value?: string | null;
}) {
    const config = HR_COLLECTIONS[code];
    if (!config) return <>{value ?? "No registrado"}</>;
    const data = hrCollection(value);
    if (!data || !data.declaracion) return <>Sin declaración registrada</>;
    if (data.declaracion === "NINGUNO") return <>{config.none}</>;
    return (
        <ul className={local.collectionView}>
            {data.registros.map((row, i) => (
                <li key={i}>
                    <dl>
                        {config.columns
                            .filter((c) => row[c.key])
                            .map((c) => (
                                <div key={c.key}>
                                    <dt>{c.label}</dt>
                                    <dd>
                                        {c.options?.[row[c.key]] || row[c.key]}
                                    </dd>
                                </div>
                            ))}
                    </dl>
                </li>
            ))}
        </ul>
    );
}
export function HrCollectionEditor({
    code,
    value,
    onChange,
    disabled,
}: {
    code: string;
    value?: string | null;
    onChange: (value: string) => void;
    disabled: boolean;
}) {
    const config = HR_COLLECTIONS[code],
        data = hrCollection(value) || { declaracion: "", registros: [] };
    if (!config) return null;
    const update = (next: typeof data) => onChange(JSON.stringify(next));
    const empty = () =>
        Object.fromEntries(config.columns.map((c) => [c.key, ""]));
    return (
        <fieldset className={local.collectionEditor} disabled={disabled}>
            <legend>{config.label}</legend>
            {code === "RH_ALERGIAS" && (
                <p className={styles.muted}>
                    Indica el medicamento y la reacción que conozcas. Si no
                    conoces alergias, selecciona esa respuesta.
                </p>
            )}
            <label htmlFor={"hr-" + code}>
                Declaración de {config.label.toLowerCase()} *
            </label>
            <select
                id={"hr-" + code}
                className={styles.control}
                required
                value={data.declaracion}
                onChange={(e) =>
                    update({
                        declaracion: e.target.value as typeof data.declaracion,
                        registros:
                            e.target.value === "REGISTRADO"
                                ? data.registros.length
                                    ? data.registros
                                    : [empty()]
                                : [],
                    })
                }
            >
                <option value="">Selecciona una respuesta</option>
                <option value="REGISTRADO">Registrar / actualizar datos</option>
                <option value="NINGUNO">{config.none}</option>
            </select>
            {data.declaracion === "REGISTRADO" && (
                <>
                    <p className={styles.muted}>
                        Puedes agregar varios registros (máximo 30). Retirar uno
                        conserva su historial cuando se aplica la actualización.
                    </p>
                    {data.registros.map((row, i) => (
                        <section
                            className={local.collectionRow}
                            key={i}
                            aria-label={config.label + " · registro " + (i + 1)}
                        >
                            <div className={styles.toolbar}>
                                <strong>Registro {i + 1}</strong>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() =>
                                        update({
                                            ...data,
                                            declaracion:
                                                data.registros.length === 1
                                                    ? ""
                                                    : data.declaracion,
                                            registros: data.registros.filter(
                                                (_, n) => n !== i,
                                            ),
                                        })
                                    }
                                >
                                    Retirar registro {i + 1}
                                </Button>
                            </div>
                            <div className={local.formGrid}>
                                {config.columns.map((c) => {
                                    const id = `hr-${code}-${i}-${c.key}`,
                                        required =
                                            c.required ||
                                            (c.key === "carrera" &&
                                                row.nivel &&
                                                ![
                                                    "PRIMARIA",
                                                    "BASICOS",
                                                ].includes(row.nivel));
                                    const props = {
                                        id,
                                        className: styles.control,
                                        value: row[c.key] || "",
                                        required: Boolean(required),
                                        onChange: (
                                            e: React.ChangeEvent<
                                                | HTMLInputElement
                                                | HTMLSelectElement
                                            >,
                                        ) =>
                                            update({
                                                ...data,
                                                registros: data.registros.map(
                                                    (r, n) =>
                                                        n === i
                                                            ? {
                                                                  ...r,
                                                                  [c.key]:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : r,
                                                ),
                                            }),
                                    };
                                    return (
                                        <div key={c.key}>
                                            <label htmlFor={id}>
                                                {c.label}
                                                {required ? " *" : ""}
                                            </label>
                                            {c.options ? (
                                                <select {...props}>
                                                    <option value="">
                                                        Selecciona una opción
                                                    </option>
                                                    {Object.entries(
                                                        c.options,
                                                    ).map(([value, label]) => (
                                                        <option
                                                            key={value}
                                                            value={value}
                                                        >
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    {...props}
                                                    type={c.type || "text"}
                                                    maxLength={c.max}
                                                    min={
                                                        c.type === "number"
                                                            ? 1900
                                                            : undefined
                                                    }
                                                    max={
                                                        c.type === "number"
                                                            ? new Date().getFullYear()
                                                            : c.type === "date"
                                                              ? new Date(
                                                                    Date.now() -
                                                                        6 *
                                                                            3600000,
                                                                )
                                                                    .toISOString()
                                                                    .slice(
                                                                        0,
                                                                        10,
                                                                    )
                                                              : undefined
                                                    }
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                    <Button
                        type="button"
                        variant="outlined"
                        state={
                            data.registros.length >= 30 ? "disabled" : "default"
                        }
                        onClick={() =>
                            update({
                                ...data,
                                registros: [...data.registros, empty()],
                            })
                        }
                    >
                        {config.add}
                    </Button>
                </>
            )}
        </fieldset>
    );
}
