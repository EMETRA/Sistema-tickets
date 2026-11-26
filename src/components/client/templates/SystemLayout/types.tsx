import { TopBarProps } from "../../organisms/TopBar/types";

export interface SystemLayoutProps {
    children: React.ReactNode;
    topBarProps: TopBarProps;
    className?: string;
}