import { AvatarStatus } from "../../atoms/Avatar/types";
import { IconName } from "../../atoms/Icon/types";

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
   * Ícono del botón de opciones
   * @default "ellipsis-vertical-solid"
   */
  menuIcon?: IconName;

  /**
   * Callback cuando se hace clic en el botón de opciones
   */
  onMenuClick?: () => void;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
