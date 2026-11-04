import Link from "next/link";
import { NavItemProps } from "./types";
import { Icon } from "../../atoms/Icon";
import styles from "./NavItem.module.scss";
import classNames from "classnames";

export const NavItem = ({
    iconName,
    label,
    active = false,
    onClick,
    href,
    className,
}: NavItemProps) => {
    const content = (
        <>
            <Icon name={iconName} size={20} color={active ? "#fff" : "#536ca1"} />
            <span className={styles.label}>{label}</span>
        </>
    );
    const classes = classNames(
        styles.navItem,
        { [styles.active]: active },
        className,
    );
    return href ? (
        <Link
            href={href}
            onClick={onClick}
            className={classes}
            aria-current={active ? "page" : undefined}
            title={label}
        >
            {content}
        </Link>
    ) : (
        <button
            className={classes}
            onClick={onClick}
            type="button"
            aria-current={active ? "page" : undefined}
            title={label}
        >
            {content}
        </button>
    );
};
export default NavItem;
