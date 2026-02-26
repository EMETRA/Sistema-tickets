export interface ToggleButtonOption {
  label: string;
  value: string;
}

export interface ToggleButtonProps {
  options: ToggleButtonOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}
