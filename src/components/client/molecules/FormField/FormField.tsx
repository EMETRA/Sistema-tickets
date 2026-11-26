"use client";

import classNames from "classnames";
import styles from "./FormField.module.scss";
import { FormFieldProps } from "./types";
import { Label } from "../../atoms/Label";

const FormField: React.FC<FormFieldProps> = ({
    label,
    htmlFor,
    required = false,
    children,
    className,
    error,
}) => {
    return (
        <div className={classNames(styles.FormField, className)}>
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </Label>

            <div className={styles.control}>{children}</div>
            {error && (
                <p role="alert" id={htmlFor + "-error"} className={styles.error}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormField;
