import { TextProps } from "./types";
import styles from "./Text.module.scss";
import classNames from "classnames";

export const Text = ({ children, variant = "body", className }: TextProps) => {
    return (
        <p className={classNames(styles.text, styles[variant], className)}>
            {children}
        </p>
    );
};
export default Text;