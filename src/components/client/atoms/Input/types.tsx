/**
 * Estados del componente Input
 */
type InputState = "default" | "focus" | "error" | "disabled";

/**
 * Propiedades del componente Input que extienden un input normal de React.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: InputState;
  className?: string;
  errorMessage?: string;
  type?: React.HTMLInputTypeAttribute;
  icon?: React.ReactNode;
  showIconLeft?: boolean;
  iconcolor?: string;
}

export type { InputProps, InputState };
