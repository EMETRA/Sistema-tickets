"use client";
import React from "react";
import NextLink from "next/link";
import styles from "./Link.module.scss";
import classNames from "classnames";

interface LinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
}

export const Link = ({ children, href, className }: LinkProps) => {
    return (
        <NextLink href={href} className={classNames(styles.link, className)}>
        {children}
        </NextLink>
    );
};
export default Link;