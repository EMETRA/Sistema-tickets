export interface ToggleButtonOption {
  label: string;
  value: string;
}

export type ToggleButtonVariant = "primary" | "secondary";

export interface ToggleButtonProps {
  options: ToggleButtonOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  /**
   * Variante del toggle button
   * @default "primary"
   */
  variant?: ToggleButtonVariant;
  /**
   * Número máximo de opciones visibles a la vez
   * Si no se especifica, muestra todas las opciones
   */
  maxVisibleOptions?: number;
}
