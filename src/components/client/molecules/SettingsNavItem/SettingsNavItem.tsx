import { SettingsNavItemProps } from "./types";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import styles from "./SettingsNavItem.module.scss";
import classNames from "classnames";

export const SettingsNavItem = ({ 
    iconName, 
    label, 
    active = false, 
    onClick,
    className 
}: SettingsNavItemProps) => {
    return (
        <button 
            className={classNames(
                styles.settingsNavItem, 
                { [styles.active]: active }, 
                className
            )}
            onClick={onClick}
            type="button"
        >
            <Icon 
                name={iconName} 
                size={24}
                className={styles.icon}
                color={"#000000"} 
            />
            <Text variant="body" className={styles.label}>
                {label}
            </Text>
        </button>
    );
};

export default SettingsNavItem;