import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import classNames from "classnames";
import { Icon } from "@/components/client/atoms/Icon";
import type { SendMessageProps } from "./types";
import styles from "./SendMessage.module.scss";

export const SendMessage = ({
    onSend,
    placeholder = "Escribe aquí",
    disabled = false,
    className,
}: SendMessageProps) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasContent = message.trim().length > 0 || files.length > 0;

    const handleSend = async () => {
        if (!hasContent || isSending) return;
        setIsSending(true);
        try {
            await onSend(message.trim(), files);
            setMessage("");
            setFiles([]);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const incoming = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...incoming]);
        e.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const isDisabled = disabled || isSending;

    return (
        <div className={classNames(styles.wrapper, { [styles.disabled]: isDisabled }, className)}>

            {/* File preview chips — above the input */}
            {files.length > 0 && (
                <div className={styles.filePreview}>
                    {files.map((file, index) => (
                        <span key={index} className={styles.fileChip}>
                            <span className={styles.fileName}>{file.name}</span>
                            <button
                                type="button"
                                className={styles.fileRemove}
                                onClick={() => handleRemoveFile(index)}
                                aria-label={`Eliminar archivo ${file.name}`}
                            >
                                x
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className={styles.container}>
                {/* Attach button */}
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDisabled}
                    aria-label="Adjuntar archivo"
                >
                    <Icon name="paperclip" size={18} variant="action" />
                </button>

                <input
                    type="text"
                    className={styles.input}
                    placeholder={placeholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    aria-label="Escribe un mensaje"
                />

                {/* Send button */}
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={handleSend}
                    disabled={isDisabled || !hasContent}
                    aria-label="Enviar mensaje"
                >
                    <Icon name="send" size={18} variant="action" />
                </button>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className={styles.fileInput}
                    onChange={handleFileChange}
                    aria-hidden="true"
                    tabIndex={-1}
                />
            </div>
        </div>
    );
};

export default SendMessage;