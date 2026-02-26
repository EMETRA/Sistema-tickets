/**
 * Estados del componente Checkbox
 */
type CheckboxState = "default" | "error" | "disabled";

/**
 * Propiedades del componente Checkbox que extienden un input checkbox normal de React.
 */
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  state?: CheckboxState;
  className?: string;
  errorMessage?: string;
  label?: string;
}

export type { CheckboxProps, CheckboxState };
