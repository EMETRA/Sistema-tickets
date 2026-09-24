import React from "react";
import { PopUpProps } from "./types";
import { PopOver } from "../../atoms/PopOver";
import { IconButton } from "@/components/client/atoms/IconButton";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";

import styles from "./PopUp.module.scss";

export const PopUp = ({
    isOpen,
    variant = "default",
    title,
    description,
    actions,
    onClose,
}: PopUpProps) => {
    return (
        <PopOver isOpen={isOpen} onClose={onClose} position="center">
            <div className={styles.popUpCard}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {title}
                    </h2>
                    {variant === 'default' && <IconButton icon="cross-solid" size={24} className={styles.mainIcon} onClick={onClose} borderless />}
                </div>

                <div className={styles.descriptionWrapper}>
                    <Text variant="body" className={styles.description}>
                        {description}
                    </Text>
                </div>

                <div className={styles.actionsWrapper}>
                    {variant === 'success' || variant === 'error' || variant === 'warning' ? (
                        <Button
                            color={variant === 'success' ? 'success' : variant === 'error' ? 'danger' : 'warning'}
                            onClick={onClose}
                        >
                            Cerrar
                        </Button>
                    ) : (actions?.map((action) => (
                        <Button key={action.text} color={action.color} onClick={action.onClick}>
                            {action.text}
                        </Button>
                    )))}
                </div>
            </div>
        </PopOver>
    );
};

export default PopUp;