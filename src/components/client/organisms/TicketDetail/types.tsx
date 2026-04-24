
import { FileProps } from "@/components/client/atoms/File";

export interface TicketDetail {
  name: string;
  status: "created" | "assigned" | "in_progress" | "resolved" | "canceled";
  description: string;
  files: Pick<FileProps, "id" | "name">[];
}

export interface TicketDetailProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}
