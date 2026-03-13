"use client";

import classNames from "classnames";
import styles from "./AuthForm.module.scss";
import { AuthFormProps } from "./types";

const AuthForm: React.FC<AuthFormProps> = ({
    title,
    children,
    onSubmit,
    className
}) => {
    return (
        <form
            className={classNames(styles.AuthForm, className)}
            onSubmit={onSubmit}
        >

            {title && <h2 className={styles.title}>{ title }</h2>}

            <div className={styles.content}>
                { children }
            </div>

        </form>
    );
};

export default AuthForm;