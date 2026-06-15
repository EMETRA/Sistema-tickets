import React from "react";
import { MemberOptionProps } from "./types";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import styles from "./MemberOption.module.scss";
import classNames from "classnames";

export const MemberOption = ({ 
    name, 
    avatarUrl, 
    initials, 
    active = false, 
    onClick, 
    className 
}: MemberOptionProps) => {
    return (
        <button 
            className={classNames(
                styles.memberOption, 
                { [styles.active]: active }, 
                className
            )}
            onClick={onClick}
            type="button"
        >
            <Avatar 
                src={avatarUrl} 
                initials={initials || name.charAt(0)} 
                size="md"
                ringed={false}
            />
            <Text variant="body" className={styles.name}>
                {name}
            </Text>
        </button>
    );
};

export default MemberOption;