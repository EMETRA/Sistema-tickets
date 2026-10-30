import type { AnalisisEvidencias as Analisis } from "@/api/graphql/juzgado";
import styles from "./JUZ01Detail.module.scss";

const etiquetas: Record<string, string> = {
  ACEPTADA: "Superó la validación",
  RECHAZADA: "Evidencias rechazadas",
  REVISION: "Sin aprobación automática",
  PENDIENTE: "Pendiente de análisis",
  ANALIZANDO: "Analizando evidencias",
  COINCIDE: "Coincide",
  DIFIERE: "Contradicción detectada",
  NO_DETERMINABLE: "No se pudo determinar",
  SIN_REFERENCIA: "Sin referencia para comparar",
  RELACIONADO: "Aporta al motivo reportado",
  AJENO: "No aporta al motivo",
  RELACIONADA: "Relacionada con el motivo",
  NO_RELACIONADA: "No relacionada",
  INDETERMINADA: "Sin determinar",
  VISIBLE: "Visible",
  PARCIAL: "Visible parcialmente",
  NO_VISIBLE: "No visible",
  COMPATIBLE: "Compatible",
  INCOMPATIBLE: "Incompatibilidad evidente",
};
const motivos: Record<string, string> = {
  RELACIONADA: "Evidencia relacionada.",
  IRRELEVANTE: "No corresponde al motivo seleccionado.",
  ILEGIBLE: "No permite apreciar los detalles.",
  INSUFICIENTE: "No permite comprobar todos los criterios.",
  CONTENIDO_SENSIBLE: "Se detectó contenido sensible.",
  VEHICULO_NO_COINCIDE: "La marca o características comparadas difieren.",
  VEHICULO_NO_VERIFICABLE: "No se pudo completar la comparación del vehículo.",
  CAPTURA_PANTALLA: "Posible captura de pantalla.",
  PLACA_NO_COINCIDE: "La lectura de placa contradice el dato reportado.",
  PLACA_NO_VISIBLE: "No se confirmó una placa visible.",
  TIPO_PLACA_NO_COINCIDE: "Incompatibilidad con el tipo de placa reportado.",
};
const etiqueta = (v: string | null | undefined) =>
  v ? etiquetas[v] || "No disponible" : "No evaluado";
const marca = (valor: string | null, indicio?: string | null) => {
  if (indicio === "NO_RECONOCIBLE" && valor !== "SIN_REFERENCIA")
    return "No se pudo determinar";
  if (valor === "COINCIDE")
    return indicio
      ? "Coincidencia visual estimada"
      : "Sin indicio visual registrado";
  return etiqueta(valor);
};
const fecha = (v: string | null) =>
  v && Number.isFinite(Date.parse(v))
    ? new Date(v).toLocaleString("es-GT", { timeZone: "America/Guatemala" })
    : "No registrada";
export function AnalisisEvidencias({
  analisis,
}: {
  analisis: Analisis | null | undefined;
}) {
  return (
    <section
      id="analisis-ia"
      className={styles.sectionCard}
      aria-labelledby="titulo-analisis"
    >
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>Apoyo a la revisión</span>
          <h2 id="titulo-analisis">Análisis automático de evidencias</h2>
        </div>
        {analisis?.disponible && (
          <span className={styles.analysisStatus} data-state={analisis.estado}>
            {etiqueta(analisis.estado)}
          </span>
        )}
      </div>
      <p className={styles.analysisNotice}>
        Este análisis automático apoya la revisión de las evidencias. La
        valoración del caso corresponde al juez.
      </p>
      {!analisis?.disponible ? (
        <p className={styles.emptyState}>
          {analisis?.estado === "ERROR_CONSULTA"
            ? "No se pudo consultar el análisis. Puedes actualizar el caso; la denuncia y la defensa continúan disponibles."
            : "No hay un análisis automático registrado para este caso."}
        </p>
      ) : (
        <>
          {analisis.modo === "OBSERVAR" && (
            <p className={styles.historyNotice}>
              Este análisis se ejecutó en modo de observación: su resultado no
              condicionó el envío del aviso.
            </p>
          )}
          {!analisis.esPoliticaConjunto && (
            <p className={styles.historyNotice}>
              Análisis histórico: se muestran los criterios de la versión
              aplicada. Los campos no evaluados no implican cumplimiento.
            </p>
          )}
          <dl className={styles.analysisMeta}>
            <div>
              <dt>Referencia vehicular</dt>
              <dd>
                {analisis.referenciaEstado === "DISPONIBLE"
                  ? analisis.referenciaFuente === "SAT_MUNI"
                    ? "Disponible · SAT"
                    : "Disponible · Registro municipal"
                  : analisis.referenciaEstado === "AMBIGUO"
                    ? "Referencia ambigua"
                    : "Sin referencia disponible"}
              </dd>
            </div>
            <div>
              <dt>Finalizado</dt>
              <dd>{fecha(analisis.terminadoEn)}</dd>
            </div>
          </dl>
          {analisis.errorReferencia && (
            <p className={styles.historyNotice}>
              No se pudo obtener la referencia vehicular.{" "}
              {analisis.esPoliticaConjunto
                ? "La comparación de marca no era obligatoria para continuar."
                : "Consulta las limitaciones de la política histórica."}
            </p>
          )}
          {analisis.codigoError && (
            <p className={styles.historyNotice}>
              El análisis registró un problema técnico; este resultado no
              acredita el cumplimiento de los criterios.
            </p>
          )}
          <div className={styles.analysisFiles}>
            {analisis.archivos.map((a, i) => (
              <article className={styles.analysisFile} key={a.idEvidencia || i}>
                <div className={styles.fileHeading}>
                  <h3>
                    {a.idEvidencia
                      ? `Evidencia ${a.idEvidencia}`
                      : `Archivo ${i + 1}`}
                  </h3>
                  <span>
                    {a.fotogramas
                      ? `${a.fotogramas} imagen${a.fotogramas === 1 ? "" : "es"} analizada${a.fotogramas === 1 ? "" : "s"}`
                      : "Análisis pendiente"}
                  </span>
                </div>
                {analisis.esPoliticaConjunto && (
                  <p className={styles.fileHint}>
                    Aporte de este archivo al conjunto; no es una decisión
                    independiente del caso.
                  </p>
                )}
                <dl className={styles.criteriaGrid}>
                  {[
                    ["Motivo reportado", a.hecho],
                    ["Presencia de placa", a.placa],
                    ["Comparación de placa", a.comparacionPlaca],
                    ["Compatibilidad del vehículo", a.compatibilidad],
                    ["Comparación de marca", a.marca],
                  ].map(([nombre, valor]) => (
                    <div key={nombre}>
                      <dt>{nombre}</dt>
                      <dd
                        data-warning={
                          valor === "DIFIERE" || valor === "INCOMPATIBLE"
                        }
                      >
                        {nombre === "Comparación de marca"
                          ? marca(valor, a.indicioMarca)
                          : etiqueta(valor)}
                      </dd>
                    </div>
                  ))}
                  <div>
                    <dt>Indicio visual de marca</dt>
                    <dd>
                      {a.indicioMarca === "EMBLEMA_EN_VEHICULO"
                        ? "Emblema en el vehículo"
                        : a.indicioMarca === "NOMBRE_EN_VEHICULO"
                          ? "Nombre del fabricante en el vehículo"
                          : a.indicioMarca === "NO_RECONOCIBLE"
                            ? "No reconocible en este archivo"
                            : "No registrado en este análisis"}
                    </dd>
                  </div>
                  <div>
                    <dt>Contenido sensible</dt>
                    <dd>
                      {a.contenidoSensible === null
                        ? "No evaluado"
                        : a.contenidoSensible
                          ? "Detectado"
                          : "No detectado"}
                    </dd>
                  </div>
                  <div>
                    <dt>Posible captura de pantalla</dt>
                    <dd>
                      {a.posiblePantalla === null
                        ? "No evaluado"
                        : a.posiblePantalla
                          ? "Detectada"
                          : "No detectada"}
                    </dd>
                  </div>
                </dl>
                {(analisis.esPoliticaConjunto ||
                  (a.marca === "COINCIDE" && !a.indicioMarca)) && (
                  <p className={styles.fileHint}>
                    {analisis.esPoliticaConjunto &&
                      "Una marca no reconocible permite continuar; no acredita coincidencia."}
                    {a.marca === "COINCIDE" &&
                      !a.indicioMarca &&
                      " La IA registró una coincidencia en el análisis anterior, sin detallar el indicio visual. Se conserva el resultado original para su revisión."}
                  </p>
                )}
                {!analisis.esPoliticaConjunto && a.motivo && (
                  <p className={styles.fileHint}>
                    {motivos[a.motivo] ||
                      "Consulta las evidencias y el resultado general."}
                  </p>
                )}
              </article>
            ))}
          </div>
          <details className={styles.traceDetails}>
            <summary>Información del análisis</summary>
            <dl className={styles.analysisMeta}>
              <div>
                <dt>Versión de criterios</dt>
                <dd>{analisis.versionPolitica || "No registrada"}</dd>
              </div>
              <div>
                <dt>Modelo</dt>
                <dd>{analisis.modelo || "No registrado"}</dd>
              </div>
              <div>
                <dt>Creado</dt>
                <dd>{fecha(analisis.creadoEn)}</dd>
              </div>
            </dl>
            <p>
              Se consulta el resultado guardado. Abrir este caso no ejecuta un
              nuevo análisis IA.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
