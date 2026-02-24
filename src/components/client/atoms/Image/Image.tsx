import NextImage from "next/image";
import { ImageProps } from "./types";
import styles from "./Image.module.scss";
import classNames from "classnames";

const Image = ({ className, rounded, alt, ...props }: ImageProps) => (
    <NextImage 
        className={classNames(styles.image, { [styles.rounded]: rounded }, className)} 
        alt={alt} 
        {...props} 
    />    
);
export default Image;