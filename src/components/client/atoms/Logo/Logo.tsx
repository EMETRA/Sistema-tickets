"use client";

import React from "react";
import Image from "next/image";
import { LogoMap, LogoProps } from "./types";
import styles from "./Logo.module.scss";
import classNames from "classnames";

const Logo: React.FC<LogoProps> = ({ 
    className, 
    name = "EmetraMain", 
    width = 180, 
    height = 60 
            }: LogoProps) => {
    const imagePath = LogoMap[name];

    return (
        <div className={classNames(styles.logoContainer, className)}>
        <Image
            src={imagePath}
            alt="Logo Emetra"
            width={typeof width === 'string' ? parseInt(width) : width}
            height={typeof height === 'string' ? parseInt(height) : height}
            priority
        />
        </div>
    );
};

export default Logo;