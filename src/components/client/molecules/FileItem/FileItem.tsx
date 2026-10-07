"use client";

import classNames from "classnames";
import styles from "./FileItem.module.scss";
import { FileItemProps } from "./types";
import { IconButton } from "../../atoms/IconButton";
import { Icon } from "../../atoms/Icon";

const FileItem: React.FC<FileItemProps> = ({
    name,
    status,
    progress = 0,
    description,
    onRemove,
    thumbnail,
    className
}) => {
    const getFileIcon = (filename: string): { icon: string; color?: string } => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
        case 'pdf':
            return { icon: 'file-pdf-solid-full', color: '#E63946' };
        case 'doc':
        case 'docx':
            return { icon: 'docx' };
        case 'xls':
        case 'xlsx':
        case 'csv':
            return { icon: 'xlsx' };
        case 'ppt':
        case 'pptx':
            return { icon: 'ppt' };
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return { icon: 'image' };
        default:
            return { icon: 'archivo' };
        }
    };
    const { icon, color } = getFileIcon(name);
    return (
        <div className={classNames(styles.FileItem, className)}>
            <div className={styles.left}>
                {thumbnail ?? <Icon name={icon} size={50} color={color} raw />}
                <div className={styles.info}>
                    <span className={styles.name}>{name}</span>
                    {description ? (
                        <span className={styles.state}>{description}</span>
                    ) : status === "done" && (
                        <span className={styles.state}>Cargado</span>
                    )}

                    {status === "uploading" && (
                        <div className={styles.upload}>
                            <div className={styles.progressBar}>
                                <div className={styles.progress} style={{ width: `${progress}%` }}/>
                            </div>
                            <span className={styles.percent}>{progress}%</span>
                        </div>
                    )}
                </div>
            </div>
            {onRemove && (
                <IconButton
                    icon={status === "done" ? "trash-solid" : "xmark-solid"}
                    // Color explícito: sin él el ícono toma el color del botón, que en modo oscuro
                    // (color-scheme: dark en globals.css) es blanco. #000000 = como se ve en modo claro.
                    iconColor="#000000"
                    onClick={onRemove}
                    aria-label={`Quitar ${name}`}
                />
            )}
        </div>
    )
};

export default FileItem;
