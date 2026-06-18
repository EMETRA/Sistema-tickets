
import type { UploadedFile } from "../../components/client/organisms/TicketCreationPanel/types";
export type { UploadedFile };

export interface casesNotificationFormData {
    destinyArea: string;
    documentDate: string;
    issuedBy: string;
    caseNumber: string;
    pageNumbers: number;
    name: string;
    reference: string;
    file: UploadedFile;
}

