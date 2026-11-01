import React from "react";
import { TitleProps } from "./types";
import styles from "./Title.module.scss";
import classNames from "classnames";

export const Title = ({ children, variant = "mid", tag: Tag = "h2", className, id }: TitleProps) => {
    return (
        <Tag id={id} className={classNames(styles.title, styles[variant], className)}>
            {children}
        </Tag>
    );
};
export default Title;