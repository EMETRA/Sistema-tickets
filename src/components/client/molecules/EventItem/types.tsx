export type TicketState = 
  | "Ingresado" 
  | "Asignado" 
  | "En Proceso" 
  | "En Revisión" 
  | "Resuelto";

export type EventItemType = "movement" | "event";

/**
 * Props base para EventItem
 */
interface BaseEventItemProps {
  /**
   * Tipo de EventItem
   */
  type: EventItemType;
  
  /**
   * Fecha del evento/movimiento
   */
  date: Date;
  
  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}

/**
 * Props específicas para el tipo "movement"
 */
export interface MovementEventItemProps extends BaseEventItemProps {
  type: "movement";
  
  /**
   * Nombre del usuario
   */
  userName: string;
  
  /**
   * URL de la imagen del avatar (opcional)
   */
  avatarSrc?: string;
  
  /**
   * Iniciales del usuario (si no hay imagen)
   */
  avatarInitials?: string;
  
  /**
   * Label personalizado o configuración para ticket
   */
  label: string | {
    /**
     * ID del ticket
     */
    ticketId: number;
    /**
     * Nuevo estado del ticket
     */
    newState: TicketState;
  };
}

/**
 * Props específicas para el tipo "event"
 */
export interface CalendarEventItemProps extends BaseEventItemProps {
  type: "event";
  
  /**
   * Nombre del evento
   */
  eventName: string;
  
  /**
   * Color del ícono (opcional)
   */
  iconColor?: string;
  
  /**
   * Color de fondo del ícono (opcional)
   */
  iconBackgroundColor?: string;
}

/**
 * Union type de todas las props posibles
 */
export type EventItemProps = MovementEventItemProps | CalendarEventItemProps;
