"use client";

import classNames from "classnames";
import styles from "./FormActions.module.scss";
import { FormActionsProps } from "./types";

const FormActions: React.FC<FormActionsProps> = ({
    children,
    align = "right",
    className
}) => {
    return (
        <div className={classNames(styles.FormActions, styles[`FormActions--${align}`], className)}>
            {children}
        </div>
    );
};

export default FormActions;