import React, { useEffect } from "react";
import { InlineAlertProps } from "./types";
import { PopOver } from "../../atoms/PopOver";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import { Button } from "../../atoms/Button";
import { IconButton } from "../../atoms/IconButton";
import styles from "./InlineAlert.module.scss";
import { AlertBar } from "../../atoms/AlertBar";
import classNames from "classnames";

export const InlineAlert = ({
    isOpen,
    onClose,
    onAction,
    title,
    description,
    actionLabel,
    iconName = "rotate-left-solid",
    duration = 5,
    className
}: InlineAlertProps) => {

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration * 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    return (
        <PopOver 
            isOpen={isOpen} 
            onClose={onClose} 
            withOverlay={false}
            position="bottom-right"
            className={classNames(className, styles.popOver)}
        >
            <div className={styles.alertContainer}>
                <div className={styles.sideBorder} />
                
                <div className={styles.mainContent}>
                    <div className={styles.header}>
                        <div className={styles.titleGroup}>
                            <Icon name={iconName} size={24} className={styles.icon} />
                            <Text variant="body" className={styles.title}>{title}</Text>
                        </div>
                        <IconButton icon="xmark-solid" size={20} onClick={onClose} borderless />
                    </div>

                    <Text variant="caption" className={styles.description}>
                        {description}
                    </Text>

                    <Button 
                        variant="contained" 
                        color="danger" 
                        onClick={onAction}
                        className={styles.actionBtn}
                    >
                        {actionLabel}
                    </Button>
                </div>

                <AlertBar 
                    duration={duration} 
                    color="#D32F2F" 
                    className={styles.progressBar} 
                />
            </div>
        </PopOver>
    );
};

export default InlineAlert;