"use client";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import styles from "./OfficePreview.module.scss";

export type OfficeDocument =
    | { kind: "word"; html: string; notes: string[] }
    | {
          kind: "spreadsheet";
          sheets: {
              name: string;
              rows: string[][];
              rowCount: number;
              columnCount: number;
              truncated: boolean;
          }[];
          notes: string[];
      };

function columnName(index: number): string {
    let result = "";
    for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26))
        result = String.fromCharCode(65 + ((n - 1) % 26)) + result;
    return result;
}

// El contenido también llega saneado desde el API; el iframe mantiene un origen aislado.
function wordDocument(html: string) {
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:32px;box-sizing:border-box;background:white;color:#24395a;font:15px/1.7 system-ui,sans-serif;overflow-wrap:anywhere}h1,h2,h3{line-height:1.35}table{border-collapse:collapse;display:block;max-width:100%;overflow:auto}td,th{border:1px solid #dce3f1;padding:8px;min-width:40px}img{max-width:100%;height:auto}blockquote{margin-left:0;border-left:3px solid #dce3f1;padding-left:16px}@media(max-width:600px){body{padding:16px}}</style></head><body>${html || "<p>El documento no contiene texto visible.</p>"}</body></html>`;
}

export function OfficePreview({
    document,
    name,
}: {
    document: OfficeDocument;
    name: string;
}) {
    const [selected, setSelected] = useState(0),
        [page, setPage] = useState(0);
    const tabs = useRef<HTMLDivElement>(null),
        id = useId();
    const sheet =
        document.kind === "spreadsheet" ? document.sheets[selected] : undefined;
    const pageSize = 50,
        start = page * pageSize;
    return (
        <div className={styles.office}>
            <div className={styles.notes}>
                <span className={styles.badge}>Solo lectura</span>
                {document.notes.map((note, index) => (
                    <p key={index}>{note}</p>
                ))}
            </div>
            {document.kind === "word" ? (
                <iframe
                    title={"Word: " + name}
                    sandbox=""
                    referrerPolicy="no-referrer"
                    srcDoc={wordDocument(document.html)}
                />
            ) : sheet ? (
                <>
                    <div
                        ref={tabs}
                        className={styles.tabs}
                        role="tablist"
                        aria-label="Hojas del archivo Excel"
                    >
                        {document.sheets.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                role="tab"
                                id={`${id}-tab-${index}`}
                                aria-controls={`${id}-sheet`}
                                aria-selected={selected === index}
                                tabIndex={selected === index ? 0 : -1}
                                onClick={() => {
                                    setSelected(index);
                                    setPage(0);
                                }}
                                onKeyDown={(event) => {
                                    const count = document.sheets.length;
                                    const next =
                                        event.key === "ArrowRight"
                                            ? (index + 1) % count
                                            : event.key === "ArrowLeft"
                                                ? (index + count - 1) % count
                                                : event.key === "Home"
                                                    ? 0
                                                    : event.key === "End"
                                                        ? count - 1
                                                        : undefined;
                                    if (next === undefined) return;
                                    event.preventDefault();
                                    setSelected(next);
                                    setPage(0);
                                    tabs.current
                                        ?.querySelectorAll<HTMLButtonElement>(
                                            "button",
                                        )
                                        [next]?.focus();
                                }}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                    <div
                        id={`${id}-sheet`}
                        className={styles.sheet}
                        role="tabpanel"
                        aria-labelledby={`${id}-tab-${selected}`}
                        tabIndex={0}
                    >
                        {sheet.rows.length ? (
                            <table>
                                <caption className={styles.srOnly}>
                                    {sheet.name} — valores guardados
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col" aria-label="Fila">
                                            #
                                        </th>
                                        {Array.from(
                                            { length: sheet.rows[0].length },
                                            (_, index) => (
                                                <th scope="col" key={index}>
                                                    {columnName(index)}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sheet.rows
                                        .slice(start, start + pageSize)
                                        .map((row, index) => (
                                            <tr key={start + index}>
                                                <th scope="row">
                                                    {start + index + 1}
                                                </th>
                                                {row.map((cell, col) => (
                                                    <td key={col}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={styles.empty}>
                                {sheet.rowCount
                                    ? "Esta hoja supera el límite de la vista previa. Descarga el original."
                                    : "La hoja está vacía."}
                            </p>
                        )}
                    </div>
                    <div className={styles.pagination}>
                        <p aria-live="polite">
                            {sheet.rows.length
                                ? `Filas ${start + 1}–${Math.min(start + pageSize, sheet.rows.length)} de ${sheet.rows.length} disponibles`
                                : "0 filas disponibles"}
                            {sheet.truncated ? " · Vista parcial" : ""}
                        </p>
                        <div>
                            <Button
                                variant="outlined"
                                state={page === 0 ? "disabled" : "default"}
                                onClick={() => setPage((value) => value - 1)}
                            >
                                Filas anteriores
                            </Button>
                            <Button
                                variant="outlined"
                                state={
                                    start + pageSize >= sheet.rows.length
                                        ? "disabled"
                                        : "default"
                                }
                                onClick={() => setPage((value) => value + 1)}
                            >
                                Filas siguientes
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <p>No hay hojas disponibles.</p>
            )}
        </div>
    );
}
