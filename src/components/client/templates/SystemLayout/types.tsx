import { SideBarNavigationProps } from "../../organisms/SideBarNavigation/types";
import { TopBarProps } from "../../organisms/TopBar/types";

export interface SystemLayoutProps {
    children: React.ReactNode;
    sidebarProps: SideBarNavigationProps;
    topBarProps: TopBarProps;
    className?: string;
}