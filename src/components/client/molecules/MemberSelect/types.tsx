import { ReactNode } from "react";

/**
 * Representa un miembro que puede ser seleccionado
 */
export interface Member {
  /**
   * ID único del miembro
   */
  id: string | number;

  /**
   * Nombre del miembro
   */
  name: string;

  /**
   * URL de la imagen del avatar (opcional)
   */
  avatarSrc?: string;

  /**
   * Iniciales del miembro
   */
  initials?: string;
}

/**
 * Props del componente MemberSelect
 */
export interface MemberSelectProps {
  /**
   * Lista de miembros disponibles para seleccionar
   */
  members: Member[];

  /**
   * ID del miembro seleccionado actualmente (opcional)
   */
  selectedId?: string | number;

  /**
   * Callback ejecutado cuando se selecciona o deselecciona un miembro
   * Si se pasa undefined, significa que se deseleccionó
   */
  onSelect?: (member: Member | undefined) => void;

  /**
   * Indica si el selector está deshabilitado
   */
  disabled?: boolean;

  /**
   * Placeholder cuando no hay selección
   */
  placeholder?: string;

  /**
   * Trigger personalizado para abrir el dropdown
   * Si se proporciona, reemplaza el trigger por defecto
   */
  children?: ReactNode;

  /**
   * Control externo del estado abierto/cerrado
   * Si se proporciona, el componente se vuelve controlado
   */
  isOpen?: boolean;

  /**
   * Callback cuando cambia el estado abierto/cerrado
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
