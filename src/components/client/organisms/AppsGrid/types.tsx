import { AppCardProps } from "../../molecules/AppCard/types";

export interface AppsGridProps {
    title: string;
    description?: string;
    showHeading?: boolean;
    apps: AppCardProps[];
    className?: string;
}
