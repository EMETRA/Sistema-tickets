
import React from "react";
import classNames from "classnames";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { UserChipProps } from "./types";

import styles from "./UserChip.module.scss";

export const UserChip: React.FC<UserChipProps> = ({ userName, avatarProps, className }) => {
    return (
        <div className={classNames(styles.AssignedChip, className)}>
            <Avatar 
                {...avatarProps}
                size="sm"
                className={styles.avatar}
            />
            <Text variant="body" className={styles.userName}>
                {userName || "Usuario"}
            </Text>
        </div>
    )
}

export default UserChip;