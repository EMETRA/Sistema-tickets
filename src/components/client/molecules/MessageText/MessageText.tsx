import React from "react";

import { Avatar } from "@/components/client/atoms/Avatar";
import { Text } from "@/components/client/atoms/Text";
import { File } from "@/components/client/atoms/File";

import classNames from "classnames";
import styles from "./MessageText.module.scss";
import { MessageTextProps } from "./types";

const MessageText: React.FC<MessageTextProps> = ({
    userName,
    text,
    timestamp,
    avatarProps,
    files,
    className
}) => {

    const handleFileClick = (fileId: string) => {
        // Implement file click handling logic here
        alert("File clicked:" + fileId);
    }

    const timestampConverter = (timestamp: string) => {
        // Si la fecha es de hoy, colocar "Hoy, HH:mm"; ayera, colocar "Ayer, HH:mm"; si es de hace más de un día, colocar "DD/MM/YYYY, HH:mm"
        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffTime = now.getTime() - messageDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return `Hoy, ${messageDate.getHours()}:${messageDate.getMinutes().toString().padStart(2, "0")}`;
        } else if (diffDays === 1) {
            return `Ayer, ${messageDate.getHours()}:${messageDate.getMinutes().toString().padStart(2, "0")}`;
        } else {
            return `${messageDate.getDate().toString().padStart(2, "0")}/${(messageDate.getMonth() + 1).toString().padStart(2, "0")}/${messageDate.getFullYear()}, ${messageDate.getHours()}:${messageDate.getMinutes().toString().padStart(2, "0")}`;
        }
    }

    return (
        <div className={classNames(styles.MessageText, className)}>
            <div className={styles.avatarContainer}>
                <Avatar {...avatarProps} />
            </div>
            <div className={styles.content}>
                <div className={styles.header}>
                    <Text variant="body">{userName}</Text>
                    <Text variant="caption" className={styles.Timestamp}>{timestampConverter(timestamp)}</Text>
                </div>
                <p className={styles.text}>{text}</p>
                {files && (
                    <div className={styles.filesContainer}>
                        {files.map((file, index) => (
                            <File key={index} {...file} onClick={handleFileClick} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageText;
