
export interface ChatProps {
    ticketId: string;
    classname?: string;
    onOpenFile?: (file: { id: string; name: string }) => void;
}
