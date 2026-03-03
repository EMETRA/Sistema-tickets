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
   * Callback ejecutado cuando se selecciona un miembro
   */
  onSelect?: (member: Member) => void;

  /**
   * Placeholder cuando no hay selección
   */
  placeholder?: string;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
