import { IconName } from "../../atoms/Icon/types";

/**
 * Tipos predefinidos de tarjetas de tickets
 */
export type TicketCardType = "entered" | "solved" | "in-progress";

/**
 * Configuración de colores e íconos para cada tipo predefinido
 */
export const TICKET_CARD_CONFIG: Record<
  TicketCardType,
  { color: string; iconName: IconName }
> = {
  entered: {
    color: "#AACC00",
    iconName: "ticket-solid",
  },
  solved: {
    color: "#E63946",
    iconName: "ticket-solid",
  },
  "in-progress": {
    color: "#FFB703",
    iconName: "ticket-solid",
  },
};

/**
 * Props cuando se usa un tipo predefinido
 */
interface TicketCardPropsWithType {
  /**
   * Tipo predefinido de tarjeta
   */
  type: TicketCardType;

  /**
   * Texto del título (ej: "Tickets Ingresados", "Tickets Resueltos")
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
interface TicketCardPropsCustom {
  /**
   * Texto del título (ej: "Tickets Ingresados", "Tickets Resueltos")
   */
  label: string;

  /**
   * Número de tickets a mostrar
   */
  value: number;

  /**
   * Color del fondo del ícono y del número (ej: "#AACC00")
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
 * Props del componente TicketCard (admite ambas formas)
 */
export type TicketCardProps = TicketCardPropsWithType | TicketCardPropsCustom;
