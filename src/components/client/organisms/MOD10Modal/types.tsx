
import type { casesNotificationFormData } from "../../../../pages/MOD10";

export interface MOD10ModalProps extends casesNotificationFormData {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: casesNotificationFormData) => void;
}
