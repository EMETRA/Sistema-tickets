import Link from "next/link";
import { useEffect, useRef } from "react";
import { SideBarNavigationProps } from "./types";
import { NavItem } from "../../molecules/NavItem";
import { Icon } from "../../atoms/Icon";
import styles from "./SideBarNavigation.module.scss";
import classNames from "classnames";

export const SideBarNavigation = ({
    items,
    sectionItems = [],
    applicationLabel,
    activePath,
    className,
    open,
    onClose,
    onLogout,
}: SideBarNavigationProps) => {
    const sidebarRef = useRef<HTMLElement>(null);
    useEffect(() => {
        if (!open) return;
        const opener = document.activeElement as HTMLElement | null;
        const mobile = window.matchMedia("(max-width: 767px)");
        const controls = () =>
            Array.from(
                sidebarRef.current?.querySelectorAll<HTMLElement>(
                    "a[href],button:not(:disabled)",
                ) || [],
            );
        if (mobile.matches) controls()[0]?.focus();
        const trap = (event: KeyboardEvent) => {
            if (
                event.key !== "Tab" ||
        !mobile.matches ||
        document.activeElement?.closest("dialog[open]")
            )
                return;
            const list = controls(),
                first = list[0],
                last = list[list.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener("keydown", trap);
        return () => {
            document.removeEventListener("keydown", trap);
            if (mobile.matches && opener?.isConnected) opener.focus();
        };
    }, [open]);
    const all = [...items, ...sectionItems];
    const active = all
        .filter(
            (item) =>
                activePath === item.path ||
        (item.path !== "/home" && activePath.startsWith(`${item.path}/`)),
        )
        .sort((a, b) => b.path.length - a.path.length)[0]?.path;
    const renderItem = (item: SideBarNavigationProps["items"][number]) => (
        <NavItem
            key={item.path}
            iconName={item.iconName}
            label={item.label}
            href={item.path}
            active={active === item.path}
            onClick={onClose}
        />
    );
    return (
        <>
            {open && (
                <button
                    type="button"
                    className={styles.backdrop}
                    onClick={onClose}
                    aria-label="Cerrar menú"
                />
            )}
            <aside
                ref={sidebarRef}
                id="system-navigation"
                aria-label="Navegación de Sistema Tickets"
                className={classNames(
                    styles.sidebar,
                    { [styles.open]: open },
                    className,
                )}
            >
                <Link href="/home" className={styles.brand} onClick={onClose}>
                    <strong>EMETRA</strong>
                    <span>SISTEMA TICKETS</span>
                </Link>
                <nav className={styles.navContainer} aria-label="Menú principal">
                    <span className={styles.groupLabel}>Mi espacio de trabajo</span>
                    <div className={styles.navItemsGroup}>{items.map(renderItem)}</div>
                    {sectionItems.length > 0 && (
                        <>
                            <span className={styles.groupLabel}>
                                {applicationLabel || "Aplicación actual"}
                            </span>
                            <div className={styles.navItemsGroup}>
                                {sectionItems.map(renderItem)}
                            </div>
                        </>
                    )}
                </nav>
                {onLogout && (
                    <div className={styles.footer}>
                        <button
                            type="button"
                            onClick={() => {
                                onClose?.();
                                onLogout();
                            }}
                        >
                            <Icon name="right-from-bracket-solid" color="#536ca1" size={20} />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};
