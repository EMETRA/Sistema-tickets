
import type { casesNotificationFormData } from "../../../../views/MOD10/types";

export interface MOD10ModalProps extends casesNotificationFormData {
    isOpen: boolean;
    loading?: boolean;
    error?: string;
    onClose: () => void;
    onSubmit: (data: casesNotificationFormData) => void;
}
