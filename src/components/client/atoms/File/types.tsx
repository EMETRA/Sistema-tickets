
export interface FileProps {
    id: string;
    name: string;
    onClick: (fileId: string) => void;
    variant?: "contained" | "outlined";
    download?: boolean;
    className?: string;
}