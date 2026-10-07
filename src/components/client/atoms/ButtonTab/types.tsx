import { IconName } from "../Icon/types";

export interface ButtonTabOption {
    label: string;
    value: string;
    icon?: IconName;
}

export interface ButtonTabProps {
    options: ButtonTabOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}
