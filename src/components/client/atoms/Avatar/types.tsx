export type AvatarSize = "sm" | "md" | "lg";
// Nuevo tipo para el estado
export type AvatarStatus = "online" | "offline" | "busy";

export interface AvatarProps {
  src?: string;
  initials?: string;
  size?: AvatarSize;
  ringed?: boolean;
  // Nueva propiedad opcional
  status?: AvatarStatus;
  className?: string;
}