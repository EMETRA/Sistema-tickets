import React from "react";
import { PermissionToggleProps } from "./types";
import { Text } from "../../atoms/Text";
import styles from "./PermissionToggle.module.scss";
import classNames from "classnames";
import { Switch } from "../../atoms/Switch";

export const PermissionToggle = ({ 
    label, 
    checked, 
    onChange, 
    id, 
    className 
}: PermissionToggleProps) => {
    return (
        <div className={classNames(styles.permissionToggle, className)}>
            <Text variant="muted" className={styles.label}>
                {label}
            </Text>
            <Switch
                id={id || `perm-${label.replace(/\s+/g, '-').toLowerCase()}`}
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                switchSize={"small"}
            />
        </div>
    );
};

export default PermissionToggle;