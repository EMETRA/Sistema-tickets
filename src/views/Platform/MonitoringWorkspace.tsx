"use client";
import { useState } from "react";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { ServerMonitor } from "@/components/client/organisms/ServerMonitor/ServerMonitor";
import { ServerFleet } from "@/components/client/organisms/ServerFleet";
import { usePlatform } from "@/platform/context";
import { useProposalDesign } from "@/platform/proposal";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";

export function MonitoringWorkspace() {
  const { data } = usePlatform();
  const proposal = useProposalDesign();
  const [tab, setTab] = useState("salud");
  const [server, setServer] = useState("");
  const [revision, setRevision] = useState(0);
  return (
    <section className={styles.page}>
      <nav className={styles.tabs} aria-label="Vistas de infraestructura">
        <button
          aria-current={tab === "salud" ? "page" : undefined}
          onClick={() => setTab("salud")}
        >
          Monitoreo
        </button>
        <button
          aria-current={tab === "catalogo" ? "page" : undefined}
          onClick={() => setTab("catalogo")}
        >
          Servidores y contenedores
        </button>
      </nav>
      {proposal ? (
        <div hidden={tab !== "salud"} className={styles.page}>
          {/* Propuesta: la flota primero; el detalle se abre al elegir un servidor. */}
          <ServerFleet
            selected={server}
            onSelect={(id) => setServer(id === server ? "" : id)}
            revision={revision}
            onLoaded={(ids) => {
              if (!server && ids[0]) setServer(ids[0]);
            }}
          />
          {server && (
            <ServerMonitor
              key={server + ":" + revision}
              initialServer={server}
              hidePicker
              active={tab === "salud"}
              canReadLogs={data?.capabilities.logs === true}
            />
          )}
          <p className={styles.muted}>
            Elige un servidor para ver sus contenedores y registros.{" "}
            <button className={styles.link} onClick={() => setRevision((r) => r + 1)}>
              Actualizar la flota
            </button>
          </p>
        </div>
      ) : (
        <div hidden={tab !== "salud"}>
          <ServerMonitor
            active={tab === "salud"}
            canReadLogs={data?.capabilities.logs === true}
          />
        </div>
      )}
      {tab === "catalogo" && <ResourceWorkspace group="infraestructura" />}
    </section>
  );
}
