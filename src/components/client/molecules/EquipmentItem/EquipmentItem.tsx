import React from "react";
import { EquipmentItemProps } from "./types";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import styles from "./EquipmentItem.module.scss";
import classNames from "classnames";

export const EquipmentItem = ({ 
    iconName, 
    title, 
    description, 
    iconColor,
    className 
}: EquipmentItemProps) => {
    return (
        <div className={classNames(styles.equipmentItem, className)}>
            <div className={styles.iconContainer}>
                <Icon 
                    name={iconName} 
                    size={32} 
                    color={iconColor}
                />
            </div>
            <div className={styles.infoContainer}>
                <Text variant="muted" className={styles.title}>
                    {title}
                </Text>
                <Text variant="body" className={styles.description}>
                    {description}
                </Text>
            </div>
        </div>
    );
};

export default EquipmentItem;