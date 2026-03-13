import React from "react";
import { SideBarNavigationProps, MENU_CONFIG } from "./types";
import { NavItem } from "../../molecules/NavItem";
import { Icon } from "../../atoms/Icon";
import styles from "./SideBarNavigation.module.scss";
import classNames from "classnames";

export const SideBarNavigation = ({ 
    role, 
    activePath, 
    onNavigate, 
    className 
}: SideBarNavigationProps) => {
    const items = MENU_CONFIG[role];

    return (
        <aside className={classNames(styles.sidebar, className)}>
            <div className={styles.logoSection}>
                <Icon name="ticket-solid" size={40} variant="navigation" active />
            </div>

            <nav className={styles.navContainer}>
                <div className={styles.navItemsGroup}>
                    {items.map((item) => (
                        <NavItem 
                            key={item.path}
                            iconName={item.iconName}
                            label={item.label}
                            active={activePath === item.path}
                            onClick={() => onNavigate(item.path)}
                        />
                    ))}
                </div>
            </nav>
        </aside>
    );
};

export default SideBarNavigation;