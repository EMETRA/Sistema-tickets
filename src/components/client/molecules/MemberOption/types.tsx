export interface MemberOptionProps {
    name: string;
    avatarUrl?: string;
    initials?: string;
    active?: boolean; // Para el estado resaltado (gris) en la captura
    onClick?: () => void;
    className?: string;
}