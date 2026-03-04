import { AvatarStatus } from "../../atoms/Avatar/types";

/**
 * Opción del menú de estado del usuario
 */
export interface UserStatusOption {
  /**
   * Etiqueta a mostrar
   */
  label: string;

  /**
   * Color del indicador (bolita)
   */
  color: string;

  /**
   * Valor único de la opción
   */
  value: string;
}

/**
 * Props del componente UserCard
 */
export interface UserCardProps {
  /**
   * Nombre completo del usuario
   */
  name: string;

  /**
   * Correo electrónico del usuario
   */
  email: string;

  /**
   * Puesto o rol del usuario
   */
  role: string;

  /**
   * URL de la imagen del avatar (opcional)
   */
  avatarSrc?: string;

  /**
   * Iniciales del usuario (si no hay imagen)
   */
  avatarInitials?: string;

  /**
   * Estado del usuario (online, offline, busy)
   */
  status?: AvatarStatus;

  /**
   * Cantidad de tickets asignados
   */
  assignedCount: number;

  /**
   * Cantidad de tickets resueltos
   */
  resolvedCount: number;

  /**
   * Callback cuando se hace clic en el botón de opciones
   */
  onMenuClick?: () => void;

  /**
   * Callback cuando se selecciona una opción del menú
   */
  onStatusChange?: (value: string) => void;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
