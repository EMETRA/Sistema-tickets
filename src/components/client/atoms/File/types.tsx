
export interface FileProps {
    id: string;
    name: string;
    onClick: (fileId: string) => void;
    className?: string;
}