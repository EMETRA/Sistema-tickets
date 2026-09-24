import React from "react";

import { Icon } from "@/components/client/atoms/Icon";
import { Text } from "@/components/client/atoms/Text";

import classNames from "classnames";
import styles from "./File.module.scss";
import { FileProps } from "./types";

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

const File: React.FC<FileProps> = ({ id, name, onClick, variant = "contained", download = false, className }) => {
    const { icon, color } = getFileIcon(name);

    return (
        <div className={classNames(styles.File, { [styles.outlined]: variant === "outlined" }, className)} onClick={() => onClick(id)}>
            <Icon name={icon} color={color} raw />
            <Text variant="body">{name}</Text>
            {download && (
                <Icon name="download-solid" color="#000000" size={24} raw />
            )}
        </div>
    );
};

export default File;
