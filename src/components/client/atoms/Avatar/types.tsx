export type AvatarSize = "sm" | "md" | "lg";
export type AvatarStatus = "online" | "offline" | "busy";

export interface AvatarProps {
  src?: string;
  initials?: string;
  size?: AvatarSize;
  ringed?: boolean;
  status?: AvatarStatus;
  className?: string;
}