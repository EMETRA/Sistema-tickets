"use client";
import { useState } from "react";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { ServerMonitor } from "@/components/client/organisms/ServerMonitor/ServerMonitor";
import { usePlatform } from "@/platform/context";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";

export function MonitoringWorkspace() {
  const { data } = usePlatform();
  const [tab, setTab] = useState("salud");
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
      <div hidden={tab !== "salud"}>
        <ServerMonitor
          active={tab === "salud"}
          canReadLogs={data?.capabilities.logs === true}
        />
      </div>
      {tab === "catalogo" && <ResourceWorkspace group="infraestructura" />}
    </section>
  );
}
