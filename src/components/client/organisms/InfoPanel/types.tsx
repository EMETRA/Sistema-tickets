import { EventItemProps } from "../../molecules/EventItem/types";

/**
 * Tipos de panel de información
 */
export type InfoPanelType = "team" | "my-activity" | "upcoming-events";

/**
 * Props del componente InfoPanel
 */
export interface InfoPanelProps {
  /**
   * Tipo de panel (determina el header y comportamiento)
   */
  type: InfoPanelType;

  /**
   * Array de eventos/movimientos a mostrar (máximo 10, se muestran 5)
   */
  items: EventItemProps[];

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
