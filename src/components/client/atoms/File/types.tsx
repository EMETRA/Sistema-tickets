
export interface FileProps {
    id: string;
    name: string;
    onClick: (fileId: string) => void;
    variant?: "contained" | "outlined";
    className?: string;
}