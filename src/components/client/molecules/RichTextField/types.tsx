export interface RichTextFieldProps {
    id?: string;
    readOnly?: boolean;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    error?: string;
}