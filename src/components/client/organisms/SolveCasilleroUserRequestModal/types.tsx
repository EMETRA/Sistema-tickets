
export interface SolveCasilleroUserRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    approve: boolean;
    onSubmit: () => void;
    email: string;
    userType: string;
    name?: string;
}
