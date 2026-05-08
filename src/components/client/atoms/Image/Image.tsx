import NextImage from "next/image";
import { ImageProps } from "./types";
import styles from "./Image.module.scss";
import classNames from "classnames";

const FALLBACK_SRC = "/images/no-user.png";

const isValidSrc = (src: unknown): boolean => {
    if (!src || src === "string") return false;
    if (typeof src === "string") return src.startsWith("/") || src.startsWith("http");
    return true;
};

const Image = ({ className, rounded, alt, src, ...props }: ImageProps) => (
    <NextImage 
        className={classNames(styles.image, { [styles.rounded]: rounded }, className)} 
        alt={alt}
        src={isValidSrc(src) ? src : FALLBACK_SRC}
        {...props} 
    />    
);

export default Image;