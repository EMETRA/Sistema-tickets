"use client";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { RepositoryStatus } from "@/components/client/organisms/RepositoryStatus/RepositoryStatus";
import { SourceCatalog } from "@/components/client/organisms/SourceCatalog/SourceCatalog";
import { usePlatform } from "@/platform/context";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Objects = {
  owner: string;
  consultadoEn: string;
  alcance: string;
  limite: number;
  limitado?: boolean;
  restriccionesLimitadas?: boolean;
  objects: {
    nombre: string;
    tipo: string;
    estado: string;
    ultimaModificacion: string;
  }[];
  constraints: {
    tabla: string;
    nombre: string;
    tipo: string;
    estado: string;
    validado: string;
  }[];
};
export function SystemsWorkspace() {
  const { data } = usePlatform();
  const [tab, setTab] = useState("catalogo"),
    [schema, setSchema] = useState<unknown>(""),
    [repo, setRepo] = useState("");
  const [result, setResult] = useState<Objects | null>(null),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [revision, setRevision] = useState(0);
  const [oracleSource, setOracleSource] = useState(false),
    [githubSource, setGithubSource] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    startTransition(() => {
      setResult(null);
      setError("");
      setLoading(false);
    });
    if (!schema || tab !== "oracle") return;
    const c = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      platformFetch<Objects>(
        "/objects/" + schema + "?q=" + encodeURIComponent(query.trim()),
        { signal: c.signal },
      )
        .then((value) => {
          if (!c.signal.aborted) setResult(value);
        })
        .catch((e: unknown) => {
          if (!c.signal.aborted)
            setError(
              e instanceof Error
                ? e.message
                : "No se pudieron consultar los objetos",
            );
        })
        .finally(() => {
          if (!c.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [schema, tab, query, revision]);
  return (
    <section className={styles.page}>
      <nav className={styles.tabs} aria-label="Aplicaciones y fuentes técnicas">
        <button
          aria-current={tab === "catalogo" ? "page" : undefined}
          onClick={() => {
            setTab("catalogo");
            setMessage("");
          }}
        >
          Aplicaciones y seguimiento
        </button>
        {!!data?.definitions.repositorios?.actions.LEER && (
          <button
            aria-current={tab === "repositorios" ? "page" : undefined}
            onClick={() => {
              setTab("repositorios");
              setMessage("");
            }}
          >
            Estado de repositorios
          </button>
        )}
        {!!data?.definitions.esquemas?.actions.LEER && (
          <button
            aria-current={tab === "oracle" ? "page" : undefined}
            onClick={() => {
              setTab("oracle");
              setMessage("");
            }}
          >
            Objetos de Oracle
          </button>
        )}
      </nav>
      {message && (
        <p role="status" className={styles.card}>
          {message}
        </p>
      )}
      {tab === "catalogo" ? (
        <ResourceWorkspace group="sistemas" />
      ) : tab === "repositorios" ? (
        <>
          {data?.actor.admin && (
            <div className={styles.toolbar}>
              <p className={styles.muted}>
                Consulta los vínculos existentes o agrega repositorios desde la
                organización.
              </p>
              <Button
                variant="outlined"
                onClick={() => setGithubSource((v) => !v)}
              >
                {githubSource
                  ? "Cerrar catálogo GitHub"
                  : "Buscar y vincular desde GitHub"}
              </Button>
            </div>
          )}
          {githubSource && (
            <SourceCatalog
              kind="github"
              onLinked={(record) => {
                setRepo(record.id);
                setGithubSource(false);
                setMessage(
                  `Repositorio ${record.nombre} vinculado. Ya puedes consultar su estado.`,
                );
              }}
            />
          )}
          <RepositoryStatus key={repo || "vinculados"} initialId={repo} />
        </>
      ) : (
        <>
          {data?.actor.admin && (
            <div className={styles.toolbar}>
              <p className={styles.muted}>
                Cada esquema se vincula con la aplicación que lo utiliza.
              </p>
              <Button
                variant="outlined"
                onClick={() => setOracleSource((v) => !v)}
              >
                {oracleSource
                  ? "Cerrar catálogo Oracle"
                  : "Buscar y vincular desde Oracle"}
              </Button>
            </div>
          )}
          {oracleSource && (
            <SourceCatalog
              kind="oracle"
              onLinked={(record) => {
                setSchema(record.id);
                setQuery("");
                setOracleSource(false);
                setMessage(`Esquema ${record.nombre} vinculado.`);
              }}
            />
          )}
          <section className={styles.card}>
            <div className={styles.toolbar}>
              <div className={styles.search}>
                <PlatformField
                  field={{
                    key: "esquemaId",
                    label: "Esquema registrado",
                    type: "ref",
                    resource: "esquemas",
                  }}
                  value={schema}
                  onChange={(value) => {
                    setSchema(value);
                    setQuery("");
                  }}
                />
              </div>
              <Button
                variant="outlined"
                state={!schema || loading ? "disabled" : "default"}
                onClick={() => setRevision((n) => n + 1)}
              >
                Actualizar objetos
              </Button>
            </div>
            {!schema && (
              <p className={styles.muted}>
                Selecciona un esquema vinculado para consultar sus objetos.{" "}
                {data?.actor.admin &&
                  "Si aún no aparece, usa «Buscar y vincular desde Oracle»."}
              </p>
            )}
            {!!schema && (
              <label className={`${styles.search} ${styles.field}`}>
                Filtrar nombres
                <input
                  className={styles.control}
                  value={query}
                  maxLength={128}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nombre de objeto, tabla o restricción"
                />
              </label>
            )}
          </section>
          {loading && <p role="status">Consultando objetos de Oracle…</p>}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {result && (
            <>
              <section className={styles.card}>
                <h2>{result.owner}</h2>
                <p className={styles.muted}>
                  Consultado {displayDate(result.consultadoEn)}. Solo se
                  muestran metadatos visibles para la cuenta del API.
                </p>
                {!result.objects.length && !result.constraints.length && (
                  <p role="status">
                    No se encontraron objetos visibles con este filtro. Revisa
                    el nombre del esquema y sus permisos de lectura.
                  </p>
                )}
                <p>
                  {result.objects.length} objetos · {result.constraints.length}{" "}
                  restricciones en esta consulta
                </p>
              </section>
              <div className={styles.grid}>
                <section className={styles.card}>
                  <h2>Tablas y objetos</h2>
                  {result.limitado && (
                    <p className={styles.muted}>
                      Se muestran {result.limite} objetos. Filtra el nombre para
                      consultar los demás.
                    </p>
                  )}
                  <div className={styles.tableRegion}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Objeto</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Última modificación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.objects.map((o) => (
                          <tr key={o.tipo + ":" + o.nombre}>
                            <td>{o.nombre}</td>
                            <td>{o.tipo}</td>
                            <td>{o.estado}</td>
                            <td>{displayDate(o.ultimaModificacion)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <section className={styles.card}>
                  <h2>Restricciones</h2>
                  {result.restriccionesLimitadas && (
                    <p className={styles.muted}>
                      Se muestran {result.limite} restricciones. Filtra el
                      nombre para consultar las demás.
                    </p>
                  )}
                  <div className={styles.tableRegion}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Tabla / restricción</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.constraints.map((o) => (
                          <tr key={o.nombre}>
                            <td>
                              {o.tabla}
                              <br />
                              {o.nombre}
                            </td>
                            <td>{o.tipo}</td>
                            <td>
                              {o.estado} · {o.validado}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
