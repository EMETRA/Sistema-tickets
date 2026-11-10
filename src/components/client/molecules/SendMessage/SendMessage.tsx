"use client";
import {
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";
import classNames from "classnames";
import { Icon } from "../../atoms/Icon";
import { SendMessageProps } from "./types";
import styles from "./SendMessage.module.scss";
import { AdministrativeChangeCancelled } from '@/api/administrative-confirmation';

export const SendMessage = ({
    onSend,
    placeholder = "Escribe una respuesta…",
    disabled = false,
    className,
}: SendMessageProps) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const id = useId();
    const isDisabled = disabled || isSending;
    const handleSend = async () => {
        if (!message.trim() || isDisabled) return;
        setIsSending(true);
        setError("");
        try {
            await onSend(message.trim(), files);
            setMessage("");
            setFiles([]);
        } catch (error) {
            if (!(error instanceof AdministrativeChangeCancelled)) setError(
                "No se pudo enviar el comentario. Conservamos el texto y los archivos para que reintentes.",
            );
        } finally {
            setIsSending(false);
        }
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void handleSend();
        }
    };
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.currentTarget.files || []);
        if (selected.length)
            setFiles((current) => [
                ...current,
                ...selected,
            ]);
        event.currentTarget.value = "";
    };
    return (
        <div className={classNames(styles.wrapper, className)}>
            <label htmlFor={id} className={styles.label}>
                Comentario
            </label>
            <textarea
                id={id}
                rows={3}
                className={styles.input}
                placeholder={placeholder}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
            />
            {files.length > 0 && (
                <div className={styles.filePreview}>
                    {files.map((file, index) => (
                        <span key={index} className={styles.fileChip}>
                            <span>{file.name}</span>
                            <button
                                type="button"
                                disabled={isDisabled}
                                aria-label={"Eliminar archivo " + file.name}
                                onClick={() =>
                                    setFiles((current) =>
                                        current.filter((_, i) => i !== index),
                                    )
                                }
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.attach}
                    disabled={isDisabled}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Icon name="paperclip" size={17} />
                    Adjuntar archivo
                </button>
                <button
                    type="button"
                    className={styles.send}
                    disabled={isDisabled || !message.trim()}
                    onClick={() => void handleSend()}
                >
                    {isSending ? "Enviando…" : "Enviar comentario"}
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className={styles.fileInput}
                onChange={handleFileChange}
                aria-hidden="true"
                tabIndex={-1}
                disabled={isDisabled}
            />
        </div>
    );
};
export default SendMessage;
