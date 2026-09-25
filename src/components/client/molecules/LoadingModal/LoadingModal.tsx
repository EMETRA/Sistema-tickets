import React from "react";
import classNames from "classnames";
import { PopOver } from "../../atoms/PopOver";
import { Text } from "../../atoms/Text";
import type { LoadingModalProps } from "./types";
import styles from "./LoadingModal.module.scss";

// Mientras se procesa, el modal no se puede cerrar.
const noop = () => {};

/**
 * Componente LoadingModal - Modal bloqueante con spinner mientras se procesa una acción.
 */
const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, title, description, className }) => (
    <PopOver isOpen={isOpen} onClose={noop} position="center">
        <div className={classNames(styles.LoadingModal, className)} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <Text variant="body" className={styles.title}>{title}</Text>
            {description && (
                <Text variant="muted" className={styles.description}>{description}</Text>
            )}
        </div>
    </PopOver>
);

export default LoadingModal;
