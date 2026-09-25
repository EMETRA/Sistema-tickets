"use client";

import { useEffect, useState } from "react";
import { Image } from "@/components/client/atoms/Image";
import { Video } from "@/components/client/atoms/Video";
import { File } from "@/components/client/atoms/File";
import { IconButton } from "@/components/client/atoms/IconButton";
import { PopOver } from "@/components/client/atoms/PopOver";
import { ImageProps } from "@/components/client/atoms/Image/types";
import { MediaGridProps } from "./types";
import styles from "./MediaGrid.module.scss";

const resolveSrc = (src: ImageProps["src"]) => {
    if (typeof src === "string") return src;
    return "src" in src ? src.src : src.default.src;
};

const MediaGrid = ({ items, columns = 1 }: MediaGridProps) => {
    const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);

    useEffect(() => {
        if (!preview) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setPreview(null);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [preview]);

    return (
        <>
            <div
                className={styles.grid}
                style={{ "--columns": columns } as React.CSSProperties}
            >
                {items.map((item, index) => {
                    if (item.type === "image") {
                        const { type, ...imageProps } = item;
                        return (
                            <button
                                key={`image-${index}`}
                                type="button"
                                className={styles.imageButton}
                                onClick={() => setPreview({
                                    src: resolveSrc(imageProps.src),
                                    alt: imageProps.alt,
                                })}
                            >
                                <Image {...imageProps} />
                            </button>
                        );
                    }

                    if (item.type === "video") {
                        const { type, ...videoProps } = item;
                        return <Video key={`video-${index}`} {...videoProps} />;
                    }

                    const { type, ...fileProps } = item;
                    return <File key={fileProps.id} download {...fileProps} />;
                })}
            </div>

            <PopOver
                isOpen={preview !== null}
                onClose={() => setPreview(null)}
                position="center"
                withOverlay
                className={styles.preview}
            >
                {preview && (
                    <div className={styles.previewBody} onClick={() => setPreview(null)}>
                        <IconButton
                            icon="cross-solid"
                            borderless
                            iconColor="#ffffff"
                            size={32}
                            className={styles.close}
                            onClick={() => setPreview(null)}
                        />
                        <img
                            src={preview.src}
                            alt={preview.alt}
                            className={styles.previewImage}
                            onClick={(event) => event.stopPropagation()}
                        />
                    </div>
                )}
            </PopOver>
        </>
    );
};

export default MediaGrid;
