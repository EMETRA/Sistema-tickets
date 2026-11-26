import type { DetalleJuzgado } from "@/api/graphql/juzgado";
import { Button } from "@/components/client/atoms/Button";
import { AnalisisEvidencias } from "./AnalisisEvidencias";
import { EvidenciasCaso } from "./EvidenciasCaso";
import styles from "./JUZ01Detail.module.scss";

type Caso = DetalleJuzgado["caso"];

const fecha = (valor?: string | null) => {
    if (!valor) return "—";
    if (!valor.endsWith("Z")) return valor;
    return new Date(valor).toLocaleString("es-GT", { timeZone: "America/Guatemala" });
};

function Datos({ campos }: { campos: [string, string | null | undefined][] }) {
    return (
        <dl className={styles.pmtFacts}>
            {campos.map(([etiqueta, dato]) => (
                <div key={etiqueta}>
                    <dt>{etiqueta}</dt>
                    <dd>{dato || "—"}</dd>
                </div>
            ))}
        </dl>
    );
}

export function ConsultaMultaPmt({ caso, onBack }: { caso: Caso; onBack: () => void }) {
    const multa = caso.multa;
    if (!multa) return null;
    const monto =
        multa.monto && Number.isFinite(Number(multa.monto))
            ? new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
                  Number(multa.monto),
              )
            : multa.monto;
    return (
        <div className={styles.mainContainer}>
            <header className={styles.pmtHeader}>
                <div>
                    <h2>
                        Multa {multa.serie}-{multa.numero}
                    </h2>
                    <p>
                        {multa.placa} · Caso {caso.codigoCaso}
                    </p>
                </div>
                <Button variant="outlined" onClick={onBack}>
                    Volver a la consulta
                </Button>
            </header>
            <div className={styles.pmtColumns}>
                <section className={styles.sectionCard} aria-labelledby="pmt-evidencias">
                    <h2 id="pmt-evidencias">Evidencias del aviso</h2>
                    <EvidenciasCaso
                        archivos={caso.evidenciasDenuncia
                            .filter((e) => e.estado === "DISPONIBLE")
                            .map((e) => ({
                                id: e.id,
                                name: "Evidencia " + e.id,
                                size: e.tamanoBytes,
                                mime: e.mime,
                                capturadaEn: e.capturadaEn,
                            }))}
                    />
                    <h3>Datos reportados</h3>
                    <Datos
                        campos={[
                            ["Placa", [caso.usoPlaca, caso.placa].join("-")],
                            ["Regla", caso.regla],
                            [
                                caso.procedimiento === "REVISION_PMT_V2"
                                    ? "Fecha de captura"
                                    : "Fecha del hecho",
                                fecha(caso.fechaHecho),
                            ],
                            ["Recibido", fecha(caso.registradaEn)],
                            [
                                "Lugar",
                                caso.lugar ||
                                    (caso.latitud && caso.longitud
                                        ? caso.latitud + ", " + caso.longitud
                                        : null),
                            ],
                            ["Observaciones", caso.observaciones],
                        ]}
                    />
                </section>
                <div className={styles.pmtRail}>
                    <section className={styles.sectionCard} aria-labelledby="pmt-multa">
                        <h2 id="pmt-multa">Multa emitida por PMT</h2>
                        <Datos
                            campos={[
                                ["Ciudad", multa.ciudad],
                                ["Regla aplicada", multa.regla],
                                ["Agente", multa.agente],
                                ["Fecha de la multa", fecha(multa.fecha)],
                                ["Fecha de pago", fecha(multa.fechaPago)],
                                ["Monto", monto],
                                ["Lugar", multa.lugar],
                                ["Fundamento", multa.fundamento],
                            ]}
                        />
                    </section>
                    <AnalisisEvidencias analisis={caso.analisisEvidencias} />
                </div>
            </div>
        </div>
    );
}
