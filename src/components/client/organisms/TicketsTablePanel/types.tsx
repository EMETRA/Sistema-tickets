import { Member } from "../../molecules/MemberSelect/types";
import { ChipState } from "../../atoms/Chip/types";

/**
 * Información de un usuario en el sistema
 * Extiende Member agregando el departamento
 */
export interface User extends Member {
  /**
   * Departamento o área del usuario
   */
  department: string;
}

/**
 * Información de un ticket en el sistema
 */
export interface Ticket {
  /**
   * ID único del ticket
   */
  id: string | number;

  /**
   * Usuario que creó el ticket
   */
  user: User;

  /**
   * Título del ticket
   */
  title: string;

  /**
   * Descripción del ticket
   */
  description: string;

  /**
   * Fecha del ticket (formato legible, ej: "Hoy, 17:24")
   */
  date: string;

  /**
   * Estado actual del ticket
   */
  status: {
    label: string;
    state: ChipState;
  };

  /**
   * Usuario asignado al ticket (null si no está asignado)
   */
  assignedTo?: User | null;
}

/**
 * Props del componente TicketsTablePanel
 */
export interface TicketsTablePanelProps {
  /**
   * Lista de tickets a mostrar en la tabla
   */
  tickets: Ticket[];

  /**
  * Callback cuando se confirma la cancelación definitiva de un ticket
  */
  onDelete?: (ticketId: string | number) => void | Promise<void>;

  /**
  * Callback para asignar/reasignar un ticket a un usuario
  */
  onAssign?: (ticketId: string | number, userId: string) => void | Promise<void>;

  /**
   * Callback cuando se exporta la tabla
   */
  onExport?: () => void;

  /**
   * Indica si la tabla está en estado de carga
   */
  loading?: boolean;

  /**
   * Clase CSS adicional
   */
  className?: string;
}
