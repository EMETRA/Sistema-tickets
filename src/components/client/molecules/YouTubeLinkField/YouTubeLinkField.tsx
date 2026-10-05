"use client";

import React, { useState } from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { parseYouTubeId, toYouTubeWatchUrl } from "@/helpers/youtube";
import type { YouTubeLinkFieldProps } from "./types";
import styles from "./YouTubeLinkField.module.scss";

export const YOUTUBE_LINK_ERROR =
    "Ingresa un enlace válido de un video de YouTube. No se aceptan Shorts ni transmisiones en vivo.";

/**
 * Campo para agregar un video de YouTube por enlace (los videos no se suben como archivo).
 * Acepta solo videos normales (helpers/youtube.ts). Se agrega con el botón o con Enter.
 */
const YouTubeLinkField: React.FC<YouTubeLinkFieldProps> = ({
    id,
    label = "¿Es un video? Pega el enlace de YouTube",
    buttonLabel = "Agregar video",
    disabled = false,
    onAdd,
    className,
}) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const add = () => {
        const youtubeId = parseYouTubeId(value);
        if (!youtubeId) {
            setError(YOUTUBE_LINK_ERROR);
            return;
        }
        onAdd(toYouTubeWatchUrl(youtubeId), youtubeId);
        setValue("");
        setError(null);
    };

    return (
        <div className={classNames(styles.YouTubeLinkField, className)}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <div className={styles.row}>
                <div className={styles.input}>
                    <Input
                        id={id}
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={value}
                        state={disabled ? "disabled" : error ? "error" : "default"}
                        errorMessage={error ?? undefined}
                        aria-invalid={Boolean(error)}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                add();
                            }
                        }}
                    />
                </div>
                <Button
                    type="button"
                    variant="outlined"
                    rounded
                    onClick={add}
                    state={disabled || value.trim() === "" ? "disabled" : "default"}
                    className={styles.button}
                >
                    {buttonLabel}
                </Button>
            </div>
        </div>
    );
};

export default YouTubeLinkField;
