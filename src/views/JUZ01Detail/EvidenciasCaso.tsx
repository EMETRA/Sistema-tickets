import { useEffect, useRef, useState } from "react";
import {
  descargarArchivoJuzgado,
  obtenerArchivoJuzgado,
} from "@/api/graphql/juzgado";
import styles from "./JUZ01Detail.module.scss";
import { ArchivoJuzgadoError } from "@/api/graphql/juzgado-archivo";
type Archivo = { id: string; name: string; size: string; mime: string };
export function EvidenciasCaso({ archivos }: { archivos: Archivo[] }) {
  const [seleccion, setSeleccion] = useState<{
    url: string;
    mime: string;
    nombre: string;
  } | null>(null);
  const [cargando, setCargando] = useState<string | null>(null),
    [error, setError] = useState<string | null>(null);
  const [ampliada, setAmpliada] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null),
    peticion = useRef<AbortController | null>(null);
  const previewVideo = useRef<HTMLVideoElement>(null);
  useEffect(
    () => () => {
      peticion.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (!seleccion) return;
    return () => URL.revokeObjectURL(seleccion.url);
  }, [seleccion]);
  useEffect(() => {
    if (ampliada) dialogo.current?.showModal();
  }, [ampliada]);
  async function abrir(a: Archivo) {
    peticion.current?.abort();
    const controller = new AbortController();
    peticion.current = controller;
    setCargando(a.id);
    setError(null);
    try {
      const blob = await obtenerArchivoJuzgado(
        "evidencias",
        a.id,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (blob.type.split(";")[0] !== a.mime || !blob.size)
        throw new Error("Formato no disponible");
      setSeleccion({
        url: URL.createObjectURL(blob),
        mime: a.mime,
        nombre: `Evidencia ${a.id}`,
      });
    } catch (error) {
      if (!controller.signal.aborted)
        setError(
          error instanceof ArchivoJuzgadoError
            ? error.message
            : "No se pudo abrir la evidencia. Puedes reintentar o descargarla.",
        );
    } finally {
      if (!controller.signal.aborted) setCargando(null);
    }
  }
  return (
    <>
      {!archivos.length ? (
        <p className={styles.emptyState}>
          No hay archivos disponibles en esta sección.
        </p>
      ) : (
        <div className={styles.evidenceGrid}>
          {archivos.map((a) => (
            <article key={a.id} className={styles.evidenceCard}>
              <div className={styles.fileKind} aria-hidden="true">
                {a.mime.startsWith("video/")
                  ? "▶"
                  : a.mime.startsWith("image/")
                    ? "▧"
                    : "▤"}
              </div>
              <div>
                <h3>Evidencia {a.id}</h3>
                <p>
                  {a.mime.startsWith("video/")
                    ? "Video"
                    : a.mime.startsWith("image/")
                      ? "Fotografía"
                      : "Documento"}{" "}
                  ·{" "}
                  {Number.isFinite(Number(a.size))
                    ? `${(Number(a.size) / 1024 / 1024).toFixed(1)} MB`
                    : "Tamaño no disponible"}
                </p>
              </div>
              <div className={styles.fileActions}>
                {/^(image\/(jpeg|png)|video\/mp4)$/.test(a.mime) && (
                  <button
                    type="button"
                    onClick={() => void abrir(a)}
                    disabled={cargando === a.id}
                  >
                    {cargando === a.id ? "Abriendo…" : "Ver evidencia"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    void descargarArchivoJuzgado(
                      "evidencias",
                      a.id,
                      `evidencia-${a.id}.${a.mime.startsWith("video/") ? "mp4" : a.mime === "image/png" ? "png" : a.mime === "application/pdf" ? "pdf" : "jpg"}`,
                    ).catch((error) =>
                      setError(
                        error instanceof ArchivoJuzgadoError
                          ? error.message
                          : "No se pudo descargar la evidencia. Intenta nuevamente.",
                      ),
                    );
                  }}
                >
                  Descargar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className={styles.historyNotice}>
          {error}
        </p>
      )}
      {seleccion && (
        <figure
          className={styles.evidencePreview}
          aria-label={`Vista de ${seleccion.nombre}`}
        >
          <figcaption className={styles.dialogHeading}>
            <strong>{seleccion.nombre}</strong>
            <div className={styles.fileActions}>
              <button
                type="button"
                onClick={() => {
                  previewVideo.current?.pause();
                  setAmpliada(true);
                }}
              >
                Ampliar
              </button>
              <button type="button" onClick={() => setSeleccion(null)}>
                Ocultar vista
              </button>
            </div>
          </figcaption>
          {seleccion.mime.startsWith("video/") ? (
            <video
              ref={previewVideo}
              controls
              autoPlay={false}
              src={seleccion.url}
            />
          ) : (
            <img src={seleccion.url} alt={seleccion.nombre} />
          )}
        </figure>
      )}
      {seleccion && ampliada && (
        <dialog
          ref={dialogo}
          className={styles.evidenceDialog}
          onCancel={() => setAmpliada(false)}
          onClose={() => setAmpliada(false)}
          aria-label={seleccion.nombre}
        >
          <div className={styles.dialogHeading}>
            <h2>{seleccion.nombre}</h2>
            <button type="button" onClick={() => setAmpliada(false)}>
              Cerrar
            </button>
          </div>
          {seleccion.mime.startsWith("video/") ? (
            <video controls autoPlay={false} src={seleccion.url} />
          ) : (
            <img src={seleccion.url} alt={seleccion.nombre} />
          )}
        </dialog>
      )}
    </>
  );
}
