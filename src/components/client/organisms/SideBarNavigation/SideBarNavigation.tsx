import { SideBarNavigationProps } from "./types";
import { NavItem } from "../../molecules/NavItem";
import { getMenuByRole } from "@/config/navigation";
import styles from "./SideBarNavigation.module.scss";
import classNames from "classnames";
import { IconButton } from "../../atoms/IconButton";

export const SideBarNavigation = ({ 
    role, 
    activePath, 
    onNavigate, 
    className 
}: SideBarNavigationProps) => {
    const items = getMenuByRole(role);

    return (
        <aside className={classNames(styles.sidebar, className)}>
            <div className={styles.logoSection}>
                <IconButton icon="ticket-solid" size={40} onClick={() => onNavigate("/home")} borderless />
            </div>

            <nav className={styles.navContainer}>
                <div className={styles.navItemsGroup}>
                    {items.map((item) => {
                        const isActive = activePath === item.path || activePath.startsWith(`${item.path}/`);
                        return (
                            <NavItem 
                                key={item.path}
                                iconName={item.iconName}
                                label={item.label}
                                active={isActive} // 👈 Pasamos el nuevo cálculo
                                onClick={() => onNavigate(item.path)}
                            />
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
};