"use client";

import classNames from "classnames";
import styles from "./FileDropzone.module.scss";
import { FileDropzoneProps } from "./types";
import { ChangeEvent, DragEvent, MouseEvent, useRef, useState } from "react";
import { Icon } from "../../atoms/Icon";
import { Button } from "../../atoms/Button";

const FileDropzone: React.FC<FileDropzoneProps> = ({
    onFiles,
    className,
    rejectedFiles,
    variant = "default",
    title = "Arrastra tu archivo o da click aquí",
    subtitle = "900MB tamaño máximo del archivo",
    buttonLabel = "Seleccionar archivo",
    multiple = true,
    accept,
    hasError = false,
}) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const isCompact = variant === "compact";

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        onFiles(multiple ? files : files.slice(0, 1));
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnter = () => setIsDragging(true);
    const handleDragLeave = () => setIsDragging(false);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        inputRef.current?.click();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        onFiles(Array.from(e.target.files));
        e.target.value = "";
    };

    return (
        <div
            className={classNames(styles.Dropzone, {
                [styles.dragging]: isDragging,
                [styles.compact]: isCompact,
                [styles.error]: hasError,
            }, className)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            role="button"
            tabIndex={0}
        >
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                className={styles.input}
                onChange={handleChange}
            />
            <div className={styles.content}>
                {!isCompact && (
                    <Icon name="file-arrow-up-solid-full" size={75} color="#4361EE" />
                )}

                <p className={styles.title}>
                    {title}
                </p>
                <p className={styles.subtitle}>
                    {subtitle}
                </p>

                {isCompact && (
                    <Button
                        type="button"
                        variant="outlined"
                        rounded
                        onClick={handleButtonClick}
                        className={styles.button}
                    >
                        {buttonLabel}
                    </Button>
                )}

                {rejectedFiles && rejectedFiles.length > 0 && ( // 👈
                    <p className={styles.rejected}>
                        {rejectedFiles.length === 1
                            ? `"${rejectedFiles[0]}" no está permitido`
                            : `${rejectedFiles.length} archivos no están permitidos: ${rejectedFiles.join(', ')}`
                        }
                    </p>
                )}
            </div>
        </div>
    )
};

export default FileDropzone;
