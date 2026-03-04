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
    className
}) => {
    return (
        <div className={classNames(styles.FormField, className)}>

            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </Label>

            <div className={styles.control}>
                {children}
            </div>

        </div>
    );
};

export default FormField;