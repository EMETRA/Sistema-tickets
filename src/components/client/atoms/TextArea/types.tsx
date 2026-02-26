/**
 * Estados del componente TextArea
 */
type TextAreaState = "default" | "focus" | "error" | "disabled";

/**
 * Propiedades del componente TextArea que extienden un textarea normal de React.
 */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: TextAreaState;
  className?: string;
  errorMessage?: string;
}

export type { TextAreaProps, TextAreaState };
