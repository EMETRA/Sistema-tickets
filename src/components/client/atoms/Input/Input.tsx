"use client";

import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import classNames from "classnames";
import styles from "./Input.module.scss";
import { InputProps } from "./types";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";

/**
 * Componente de entrada reutilizable que admite tipos text, password y file.
 *
 * @param {InputProps} props - Las propiedades del componente de entrada.
 * @returns {JSX.Element} El componente de entrada renderizado.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", className, state = "default", errorMessage, icon, showIconLeft = false, ...props }, ref) => {
    // Estado para controlar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);

    // Referencia interna al input
    const inputRef = useRef<HTMLInputElement>(null);

    // Combina la referencia interna con la referencia pasada
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    /**
     * Alternar la visibilidad de la contraseña
     */
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    /**
     * Manejar el clic en el input de tipo file
     */
    const handleFileClick = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };

    // Construir las clases CSS dinámicamente usando classnames
    const inputClasses = classNames(styles.Input, {
      [styles.InputText]: type === "text" && icon,
      [styles.InputError]: state === "error",
    }, className);

    const containerClasses = classNames(styles.Container, {
      [styles.ContainerFile]: type === "file",
      [styles.ContainerText]: type === "text" && icon,
      [styles.IconLeft]: icon && showIconLeft,
      [styles.IconRight]: icon && !showIconLeft,
      [styles.ContainerPassword]: type === "password",
      [styles.ContainerFileDisabled]: type === "file" && state === "disabled",
    });

    // Renderizado según el tipo de input
    if (type === "password") {
      return (
        <>
          <div className={containerClasses}>
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              className={inputClasses}
              disabled={state === "disabled"}
              {...props}
            />
            <IconButton
              icon={showPassword ? "eye-off" : "eye"}
              size={20}
              onClick={togglePasswordVisibility}
              disabled={state === "disabled"}
              borderless={true}
              className={styles.IconButton}
            />
          </div>
          {state === "error" && errorMessage && (
            <span className={styles.ErrorMessage}>{errorMessage}</span>
          )}
        </>
      );
    }

    if (type === "file") {
      return (
        <>
          <div
            className={containerClasses}
            onClick={handleFileClick}
            role="button"
            tabIndex={state === "disabled" ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleFileClick();
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              className={styles.HiddenFileInput}
              disabled={state === "disabled"}
              {...props}
            />
            <Icon name="file" variant="status" size={40} />
            <div className={styles.FileContent}>
              <p className={styles.FileMainText}>Arrastra tu archivo aquí o</p>
              <p className={styles.FileLinkText}>da click aquí</p>
              <p className={styles.FileSizeText}>900 MB tamaño máximo del archivo</p>
            </div>
          </div>
          {state === "error" && errorMessage && (
            <span className={styles.ErrorMessage}>{errorMessage}</span>
          )}
        </>
      );
    }

    // Input tipo text (default)
    if (icon) {
      return (
        <>
          <div className={containerClasses}>
            {showIconLeft && (
              <div className={classNames(styles.IconButtonLeft, {
                [styles.IconContainerDisabled]: state === "disabled"
              })}>
                {icon}
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              className={inputClasses}
              disabled={state === "disabled"}
              {...props}
            />
            {!showIconLeft && (
              <div className={classNames(styles.IconButtonRight, {
                [styles.IconContainerDisabled]: state === "disabled"
              })}>
                {icon}
              </div>
            )}
          </div>
          {state === "error" && errorMessage && (
            <span className={styles.ErrorMessage}>{errorMessage}</span>
          )}
        </>
      );
    }
    
    return (
      <>
        <input
          ref={inputRef}
          type="text"
          className={inputClasses}
          disabled={state === "disabled"}
          {...props}
        />
        {state === "error" && errorMessage && (
          <span className={styles.ErrorMessage}>{errorMessage}</span>
        )}
      </>
    );
  }
);

Input.displayName = "Input";

export default Input;