
import type { casesNotificationFormData } from "../../../../views/MOD10/types";

export interface MOD10ModalProps extends casesNotificationFormData {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: casesNotificationFormData) => void;
}
