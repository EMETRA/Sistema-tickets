"use client";

import React from "react";
import classNames from "classnames";
import { Button } from "../Button";
import { ButtonTabProps } from "./types";
import styles from "./ButtonTab.module.scss";

export const ButtonTab: React.FC<ButtonTabProps> = ({
    options,
    value,
    onChange,
    disabled = false,
    className,
}) => {
    const handleClick = (optionValue: string) => {
        if (!disabled) onChange(optionValue);
    };

    return (
        <div
            className={classNames(styles.group, {
                [styles.disabled]: disabled,
            }, className)}
        >
            {options.map((option) => {
                const selected = option.value === value;

                return (
                    <Button
                        key={option.value}
                        variant={selected ? "contained" : "text"}
                        color="default"
                        icon={option.icon}
                        left={Boolean(option.icon)}
                        onClick={() => handleClick(option.value)}
                        state={disabled ? "disabled" : "default"}
                        className={classNames(styles.button, {
                            [styles.selected]: selected,
                            [styles.unselected]: !selected,
                        })}
                    >
                        {option.label}
                    </Button>
                );
            })}
        </div>
    );
};

export default ButtonTab;
