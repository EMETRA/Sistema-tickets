import { IconName } from "../../atoms/Icon/types";

/**
 * Tipos predefinidos de estadísticas de tickets
 */
export type TicketStatType = "solved" | "working" | "entered" | "assigned";

/**
 * Configuración de colores e íconos para cada tipo predefinido
 */
export const TICKET_STAT_CONFIG: Record<
  TicketStatType,
  { color: string; iconName: IconName }
> = {
  solved: {
    color: "#E63946",
    iconName: "ticket-solid",
  },
  working: {
    color: "#FFB703",
    iconName: "ticket-solid",
  },
  entered: {
    color: "#80B918",
    iconName: "ticket-solid",
  },
  assigned: {
    color: "#FB8500",
    iconName: "ticket-solid",
  },
};

/**
 * Props cuando se usa un tipo predefinido
 */
interface TicketStatPropsWithType {
  /**
   * Tipo predefinido de estadística
   */
  type: TicketStatType;

  /**
   * Texto del título (ej: "Tickets resueltos", "Tickets pendientes")
   */
  label: string;

  /**
   * Número de tickets a mostrar
   */
  value: number;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;

  /**
   * No se permiten color e iconName cuando se usa type
   */
  color?: never;
  iconName?: never;
}

/**
 * Props cuando se usan color e ícono personalizados
 */
interface TicketStatPropsCustom {
  /**
   * Texto del título (ej: "Tickets resueltos", "Tickets pendientes")
   */
  label: string;

  /**
   * Número de tickets a mostrar
   */
  value: number;

  /**
   * Color del fondo del ícono y del texto del valor (ej: "#E63946")
   */
  color: string;

  /**
   * Nombre del ícono a mostrar (sin extensión .svg)
   */
  iconName: IconName;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;

  /**
   * No se permite type cuando se usan color/iconName personalizados
   */
  type?: never;
}

/**
 * Props del componente TicketStat (admite ambas formas)
 */
export type TicketStatProps = TicketStatPropsWithType | TicketStatPropsCustom;
