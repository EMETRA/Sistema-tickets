

export interface MyStatisticsPanelProps {
  /**
   * Porcentaje de 0 a 100
   * */
  percentage: number;

  /**
   * Número de tickets resueltos
   */
  resolvedTickets: number;

  /**
   * Número de tickets asignados
   */
  assignedTickets: number;
  
  /**
   * Número de tickets en progreso
   */
  inProgressTickets: number;
}
