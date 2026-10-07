import { VideoProps } from "./types";
import styles from "./Video.module.scss";
import classNames from "classnames";

const isValidSrc = (src: unknown): src is string => {
    if (!src || src === "string") return false;
    if (typeof src === "string") return src.startsWith("/") || src.startsWith("http");
    return false;
};

const Video = ({ className, rounded, src, controls = true, ...props }: VideoProps) => {
    if (!isValidSrc(src)) return null;

    return (
        <video
            className={classNames(styles.video, { [styles.rounded]: rounded }, className)}
            src={src}
            controls={controls}
            {...props}
        />
    );
};

export default Video;
