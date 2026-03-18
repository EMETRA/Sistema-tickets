
"use client";

import { useEffect, useState } from "react";
import classNames from "classnames";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { DropdownMenu } from "@/components/client/molecules/DropdownMenu";
import { PerformanceChartPanel } from "@/components/client/organisms/PerformanceChartPanel";
import { SecondaryFilterConfig } from "@/components/client/organisms/PerformanceChartPanel/types";
import { BarChartDataPoint } from "@/components/client/atoms/BarChart/types";
import {
  getStatisticsFilterConfigDummy,
  getStatisticsPerformanceDummy,
} from "@/api/graphql/queries/getStatistics";
import { getSystemsDummy } from "@/api/graphql/queries/getSystems";
import styles from "./Statistics.module.scss";

export const Statistics = () => {
  const [systems, setSystems] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedSystem, setSelectedSystem] = useState({ label: "", value: "" });
  const [filterConfig, setFilterConfig] = useState<SecondaryFilterConfig | null>(null);
  const [selectedParentFilter, setSelectedParentFilter] = useState("");
  const [selectedChildFilter, setSelectedChildFilter] = useState("");
  const [data, setData] = useState<BarChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeFilters = async () => {
      try {
        setIsLoading(true);
        setError("");

        const systemsData = await getSystemsDummy();
        const config = await getStatisticsFilterConfigDummy();
        const defaultParent = config.parentOptions[0]?.value || "";
        const defaultChild = config.childOptionsByParent[defaultParent]?.[0]?.value || "";

        setSystems(systemsData);
        setSelectedSystem(systemsData[0] || { label: "", value: "" });
        setFilterConfig(config);
        setSelectedParentFilter(defaultParent);
        setSelectedChildFilter(defaultChild);
      } catch (fetchError) {
        console.error("Error cargando filtros de estadisticas:", fetchError);
        setError("No fue posible inicializar los filtros del reporte.");
        setIsLoading(false);
      }
    };

    initializeFilters();
  }, []);

  useEffect(() => {
    if (!selectedParentFilter || !selectedChildFilter) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getStatisticsPerformanceDummy(selectedParentFilter, selectedChildFilter);
        setData(response);
      } catch (fetchError) {
        console.error("Error cargando estadisticas:", fetchError);
        setError("No fue posible cargar el reporte de rendimiento.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedParentFilter, selectedChildFilter]);

  const handleParentFilterChange = (value: string) => {
    setSelectedParentFilter(value);
    const nextChild = filterConfig?.childOptionsByParent[value]?.[0]?.value || "";
    setSelectedChildFilter(nextChild);
  };

  return (
    <div className={classNames(styles.Statistics)}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <DropdownMenu
            items={systems}
            onSelect={(item) => setSelectedSystem(item)}
            className={styles.systemDropdown}
          />
          <Text variant="caption">Reporte del:</Text>
          <Text variant="body">{selectedSystem.label || "Seleccione un sistema"}</Text>
        </div>
        <Button variant="contained" icon="print-solid" left>Imprimir</Button>
      </div>
      <div className={styles.content}>
        {isLoading ? (
          <div>Cargando estadisticas...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <PerformanceChartPanel
            variant="secondary"
            data={data}
            filterConfig={filterConfig || { parentOptions: [], childOptionsByParent: {} }}
            selectedParentFilter={selectedParentFilter}
            selectedChildFilter={selectedChildFilter}
            onParentFilterChange={handleParentFilterChange}
            onChildFilterChange={setSelectedChildFilter}
          />
        )}
      </div>
    </div>
  )
}

export default Statistics;
