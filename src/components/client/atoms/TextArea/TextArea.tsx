"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import classNames from "classnames";
import styles from "./TextArea.module.scss";
import { TextAreaProps } from "./types";

/**
 * Componente de área de texto reutilizable con diferentes estados.
 *
 * @param {TextAreaProps} props - Las propiedades del componente de textarea.
 * @returns {JSX.Element} El componente de textarea renderizado.
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, state = "default", errorMessage, ...props }, ref) => {
    // Referencia interna al textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Combina la referencia interna con la referencia pasada
    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

    // Construir las clases CSS dinámicamente usando classnames
    const textareaClasses = classNames(styles.TextArea, {
      [styles.TextAreaError]: state === "error",
    }, className);

    return (
      <>
        <textarea
          ref={textareaRef}
          className={textareaClasses}
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

TextArea.displayName = "TextArea";

export default TextArea;
