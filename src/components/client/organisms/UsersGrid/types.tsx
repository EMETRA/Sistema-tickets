import { UserCardProps } from "../../molecules/UserCard/types";

export interface UsersGridProps {
    title: string;
    iconName: string;
    users: UserCardProps[];
    className?: string;
    pathActive?: string;
}