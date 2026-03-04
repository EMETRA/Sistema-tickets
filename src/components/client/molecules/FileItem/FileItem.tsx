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
    onRemove,
    className
}) => {
    return (
        <div className={classNames(styles.FileItem, className)}>

            <div className={styles.left}>

                <Icon name="file-pdf-solid-full" size={50} color="#E63946"/>

                <div className={styles.info}>
                    <span className={styles.name}>{name}</span>
                    {status === "done" && (
                        <span className={styles.state}>Cargado</span>
                    )}

                    {status === "uploading" && (
                        <div className={styles.upload}>
                            <div className={styles.progressBar}>
                                <div className={styles.progress} style={{ width: `${progress}%` }}/>
                            </div>

                            <span className={styles.percent}>
                                {progress}%
                            </span>

                        </div>
                
                    )}

                </div>

            </div>

            {onRemove && (
                <IconButton icon={status === "done" ? "trash-solid" : "xmark-solid"} onClick={onRemove} />
            )}

            

        </div>

    )
};

export default FileItem;