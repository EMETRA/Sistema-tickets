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
  type?: "text" | "password" | "file";
  icon?: React.ReactNode;
  showIconLeft?: boolean;
}

export type { InputProps, InputState };
