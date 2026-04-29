"use client";

import classNames from "classnames";
import styles from "./FileDropzone.module.scss";
import { FileDropzoneProps } from "./types";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Icon } from "../../atoms/Icon";

const FileDropzone: React.FC<FileDropzoneProps> = ({
    onFiles,
    className,
    rejectedFiles
}) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(e.dataTransfer.files));
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnter = () => setIsDragging(true);
    const handleDragLeave = () => setIsDragging(false);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        onFiles(Array.from(e.target.files));
        e.target.value = "";
    };

    return (
        <div 
            className={classNames(styles.Dropzone, {[styles.dragging]: isDragging}, className)}
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
                multiple
                className={styles.input}
                onChange={handleChange}
            />
            <div className={styles.content}>
                <Icon name="file-arrow-up-solid-full" size={75} color="#4361EE" />
        
                <p className={styles.title}>
                    Arrastra tu archivo o da click aquí
                </p>
                <p className={styles.subtitle}>
                    900MB tamaño máximo del archivo
                </p>

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