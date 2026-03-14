import { AvatarProps } from "@/components/client/atoms/Avatar";

export interface UserChipProps {
  userName: string;
  avatarProps?: Pick<AvatarProps, "initials" | "src">;
  className?: string;
}