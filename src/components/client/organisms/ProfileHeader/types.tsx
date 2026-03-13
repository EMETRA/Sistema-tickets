import { CardSwitchOption } from "../../molecules/CardSwitch/types";

export interface ProfileHeaderProps {
    bannerSrc: string;
    avatarSrc?: string;
    initials: string;
    name: string;
    role: string;
    switchOptions: CardSwitchOption[];
    switchValue: string;
    onSwitchChange: (value: string) => void;
}