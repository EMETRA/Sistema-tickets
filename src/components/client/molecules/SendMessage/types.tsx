export interface SendMessageProps {
    onSend: (message: string, files: File[]) => Promise<void> | void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}