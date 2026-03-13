import { AppCardProps } from "../../molecules/AppCard/types";

export interface AppsGridProps {
    title: string;
    apps: AppCardProps[];
    className?: string;
}