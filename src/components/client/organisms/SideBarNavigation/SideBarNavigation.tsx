import { SideBarNavigationProps } from "./types";
import { NavItem } from "../../molecules/NavItem";
import styles from "./SideBarNavigation.module.scss";
import classNames from "classnames";
import { IconButton } from "../../atoms/IconButton";

export const SideBarNavigation = ({
    items,
    activePath,
    onNavigate,
    logoIcon = "ticket-solid",
    className,
}: SideBarNavigationProps) => {
    const isAppContext = logoIcon === "house-solid";

    return (
        <aside className={classNames(styles.sidebar, className)}>
            <div className={styles.logoSection}>
                <IconButton
                    icon={logoIcon}
                    size={40}
                    onClick={() => onNavigate("/home")}
                    borderless
                    iconColor="#FFFFFF"
                    aria-label={isAppContext ? "Volver al inicio" : "Inicio"}
                    title={isAppContext ? "Volver al inicio" : "Inicio"}
                />
            </div>

            <nav className={styles.navContainer}>
                <div className={styles.navItemsGroup}>
                    {items.map((item) => {
                        const isActive =
                            activePath === item.path ||
                            activePath.startsWith(`${item.path}/`);
                        return (
                            <NavItem
                                key={item.path}
                                iconName={item.iconName}
                                label={item.label}
                                active={isActive}
                                onClick={() => onNavigate(item.path)}
                            />
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
};
