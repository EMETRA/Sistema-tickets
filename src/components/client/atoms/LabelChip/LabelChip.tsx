import React from "react";
import classNames from "classnames";
import { LabelChipProps } from "./types";
import styles from "./LabelChip.module.scss";

export const LabelChip = ({
    label,
    variant = "default",
    onRemove,
    className,
    color,
    backgroundColor,
}: LabelChipProps) => {
    const isCustom = !!(color || backgroundColor);

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onRemove?.(label);
    };

    return (
        <span
            className={classNames(
                styles.chip,
                !isCustom && styles[variant],
                className
            )}
            style={
                isCustom
                    ? {
                        color: color,
                        backgroundColor: backgroundColor,
                    }
                    : undefined
            }
        >
            <span className={styles.label}>{label}</span>

            {onRemove && (
                <button
                    type="button"
                    className={styles.removeButton}
                    onClick={handleRemove}
                    aria-label={`Remove label ${label}`}
                >
                    x
                </button>
            )}
        </span>
    );
};

export default LabelChip;
