"use client";

import React, { forwardRef } from "react";
import classNames from "classnames";
import { Button } from "../Button";
import type { ToggleButtonProps } from "./types";
import styles from "./ToggleButton.module.scss";

export const ToggleButton = forwardRef<HTMLDivElement, ToggleButtonProps>(
  ({ options, value, onChange, disabled = false, }, ref) => {
    const handleClick = (optionValue: string) => {
      if (!disabled && onChange) {
        onChange(optionValue);
      }
    };

    return (
      <div
        ref={ref}
        className={classNames(styles.ToggleButton, {
          [styles["ToggleButton--disabled"]]: disabled,
        })}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          if (isSelected) {
            return (
              <Button
                key={option.value}
                variant="contained"
                color="default"
                rounded
                onClick={() => handleClick(option.value)}
                state={disabled ? "disabled" : "default"}
              >
                {option.label}
              </Button>
            );
          }

          return (
            <button
              key={option.value}
              type="button"
              className={styles.ToggleButton__unselected}
              onClick={() => handleClick(option.value)}
              disabled={disabled}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);

ToggleButton.displayName = "ToggleButton";
