"use client";

import classNames from "classnames";
import styles from "./SelectField.module.scss";
import { SelectFieldProps } from "./types";
import { Label } from "../../atoms/Label";

const SelectField: React.FC<SelectFieldProps> = ({
    label,
    htmlFor,
    required,
    children,
    className
}) => {
    return (
        <div className={classNames(styles.SelectField, className)}>
            
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </Label>

            {children}

        </div>
    );
};

export default SelectField;