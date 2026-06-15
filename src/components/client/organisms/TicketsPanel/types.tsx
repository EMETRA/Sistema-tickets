import { ChipState } from "../../atoms/Chip/types";

/**
 * Variantes de la tabla de tickets
 */
export type TicketsPanelVariant = "my-tickets" | "recent-tickets";

/**
 * Datos de un ticket para la tabla
 */
export interface TicketData {
  /**
   * ID del ticket
   */
  id: number;

  /**
   * Descripción/problema del ticket
   */
  description: string;

  /**
   * Nombre del usuario asignado
   */
  userName: string;

  /**
   * URL de la imagen del avatar (opcional)
   */
  avatarSrc?: string;

  /**
   * Iniciales del usuario
   */
  avatarInitials?: string;

  /**
   * Indica si está asignado
   */
  assigned: boolean;

  /**
   * Tipo de problema (ej: "Urgente", "Normal", "Hardware", etc.)
   */
  type: string;

  /**
   * Estado del ticket para el Chip
   */
  status: ChipState;

  /**
   * Label a mostrar en el Chip de estado
   */
  statusLabel: string;

  /**
   * Fecha de ingreso del ticket
   */
  dateIngress: Date;

  /**
   * Fecha de asignación del ticket (opcional)
   */
  dateAssigned?: Date;
}

/**
 * Props del componente TicketsPanel
 */
export interface TicketsPanelProps {
  /**
   * Variante de la tabla
   */
  variant: TicketsPanelVariant;

  /**
   * Array de tickets a mostrar (máximo 10)
   */
  tickets: TicketData[];

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
