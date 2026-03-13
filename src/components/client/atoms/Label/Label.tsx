import React from "react";
import styles from "./Label.module.scss";
import classNames from "classnames";

interface LabelProps {
    children: React.ReactNode;
    htmlFor: string;
    className?: string;
}

export const Label = ({ children, htmlFor, className }: LabelProps) => {
    return (
        <label htmlFor={htmlFor} className={classNames(styles.label, className)}>
        {children}
        </label>
    );
};


export default Label;