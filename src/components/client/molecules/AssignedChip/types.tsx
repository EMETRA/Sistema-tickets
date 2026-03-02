/**
 * Props del componente AssignedChip
 */
export interface AssignedChipProps {
  /**
   * Indica si está asignado a un usuario
   */
  assigned: boolean;

  /**
   * Nombre del usuario asignado (requerido si assigned = true)
   */
  userName?: string;

  /**
   * URL de la imagen del avatar (opcional)
   */
  avatarSrc?: string;

  /**
   * Iniciales del usuario (si no hay imagen)
   */
  avatarInitials?: string;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
