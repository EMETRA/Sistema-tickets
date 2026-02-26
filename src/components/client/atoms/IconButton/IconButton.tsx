"use client";

import React, { forwardRef } from "react";
import classNames from "classnames";
import styles from "./IconButton.module.scss";
import { IconButtonProps } from "./types";
import { Icon } from "../Icon";

/**
 * Componente de botón con icono que admite estados default, hover, disabled y loading.
 *
 * @param {IconButtonProps} props - Las propiedades del componente IconButton.
 * @returns {JSX.Element} El componente IconButton renderizado.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 24, disabled = false, loading = false, onClick, borderless = false, className, ...props }, ref) => {
    // El botón está deshabilitado si disabled=true O loading=true
    const isDisabled = disabled || loading;

    /**
     * Manejar el clic del botón
     */
    const handleClick = () => {
      if (!isDisabled && onClick) {
        onClick();
      }
    };

    // Construir las clases CSS dinámicamente
    const buttonClasses = classNames(
      styles.IconButton,
      {
        [styles.Loading]: loading,
        [styles.Disabled]: isDisabled,
        [styles.Borderless]: borderless,
      },
      className
    );

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={buttonClasses}
        {...props}
      >
        <Icon name={icon} variant="action" size={size} />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
