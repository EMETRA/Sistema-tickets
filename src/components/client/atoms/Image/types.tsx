import { ImageProps as NextImageProps } from "next/image";
export interface ImageProps extends NextImageProps {
    className?: string;
    rounded?: boolean;
}