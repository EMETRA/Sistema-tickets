"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import classNames from "classnames";
import styles from "./Checkbox.module.scss";
import { CheckboxProps } from "./types";
import { Icon } from "../Icon";

/**
 * Componente de checkbox reutilizable con diferentes estados.
 *
 * @param {CheckboxProps} props - Las propiedades del componente de checkbox.
 * @returns {JSX.Element} El componente de checkbox renderizado.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, state = "default", errorMessage, label, id, size = 16, ...props }, ref) => {
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
          <div 
            className={styles.CheckboxButton}
            style={{
              width: size,
              height: size,
              minWidth: size,
              minHeight: size,
            }}
          >
            <Icon
              name="check-solid"
              size={size * 0.7}
              className={styles.CheckIcon}
            />
          </div>
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
