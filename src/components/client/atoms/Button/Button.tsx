"use client";

import React, { forwardRef } from "react";
import classNames from "classnames";
import styles from "./Button.module.scss";
import { ButtonProps } from "./types";

/**
 * Componente de botón reutilizable con diferentes variantes, colores y estados.
 *
 * @param {ButtonProps} props - Las propiedades del componente de botón.
 * @returns {JSX.Element} El componente de botón renderizado.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "contained",
      color = "default",
      rounded = false,
      fullWidth = false,
      state = "default",
      className,
      children,
      loadingText = "Cargando...",
      ...props
    },
    ref
  ) => {
    // Determinar si el botón está deshabilitado
    const isDisabled = state === "disabled" || state === "loading";

    // Construir las clases CSS dinámicamente usando classnames
    const buttonClasses = classNames(
      styles.Button,
      styles[`Button--${variant}`],
      styles[`Button--${color}`],
      {
        [styles["Button--rounded"]]: rounded && (variant === "contained" || variant === "outlined"),
        [styles["Button--fullWidth"]]: fullWidth,
        [styles["Button--disabled"]]: state === "disabled",
        [styles["Button--loading"]]: state === "loading",
      },
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {state === "loading" ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
