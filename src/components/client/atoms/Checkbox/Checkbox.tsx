"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import classNames from "classnames";
import styles from "./Checkbox.module.scss";
import { CheckboxProps } from "./types";

/**
 * Componente de checkbox reutilizable con diferentes estados.
 *
 * @param {CheckboxProps} props - Las propiedades del componente de checkbox.
 * @returns {JSX.Element} El componente de checkbox renderizado.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, state = "default", errorMessage, label, id, ...props }, ref) => {
    // Referencia interna al checkbox
    const checkboxRef = useRef<HTMLInputElement>(null);

    // Combina la referencia interna con la referencia pasada
    useImperativeHandle(ref, () => checkboxRef.current as HTMLInputElement, []);

    // Generar un ID único si no se proporciona
    const checkboxId = id || `checkbox-${label}`;

    // Construir las clases CSS dinámicamente usando classnames
    const containerClasses = classNames(styles.Container, {
      [styles.ContainerError]: state === "error",
      [styles.ContainerDisabled]: state === "disabled",
    }, className);

    return (
      <div className={styles.Wrapper}>
        <label htmlFor={checkboxId} className={containerClasses}>
          <input
            ref={checkboxRef}
            type="checkbox"
            id={checkboxId}
            className={styles.HiddenCheckbox}
            disabled={state === "disabled"}
            {...props}
          />
          <span className={styles.StyledCheckbox}>
            <svg
              className={styles.CheckIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {label && <span className={styles.Label}>{label}</span>}
        </label>
        {state === "error" && errorMessage && (
          <span className={styles.ErrorMessage}>{errorMessage}</span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
