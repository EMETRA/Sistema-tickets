import { AvatarProps } from "@/components/client/atoms/Avatar";
import { FileProps } from "@/components/client/atoms/File";

export interface MessageTextProps {
    userName: string;
    text: string;
    timestamp: string;
    avatarProps: AvatarProps;
    files?: FileProps[];
    className?: string;
}
