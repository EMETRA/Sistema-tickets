export interface ModalUserSelectProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedUserId: string) => void;
}