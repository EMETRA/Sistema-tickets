export interface CardSwitchOption {
    label: string;
    value: string;
}

export interface CardSwitchProps {
    options: CardSwitchOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    fullWidth?: boolean;
}