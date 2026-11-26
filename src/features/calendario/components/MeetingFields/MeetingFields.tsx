"use client";
import { useId, useState } from "react";
import { isValidMeetingUrl, meetingLink, meetingPlace, meetingProvider } from "@/platform/meeting";
import styles from "./MeetingFields.module.scss";

/**
 * «Lugar o enlace» de una actividad como elección explícita: presencial
 * (sala) o virtual (enlace + sala opcional si es híbrida). Se guarda en el
 * mismo campo «lugar» para no cambiar el esquema del API.
 */
export function MeetingPlaceField({
    value,
    onChange,
    disabled,
}: {
    value: unknown;
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    const id = useId();
    const initialLink = meetingLink(value);
    const [mode, setMode] = useState<"PRESENCIAL" | "VIRTUAL">(initialLink ? "VIRTUAL" : "PRESENCIAL"),
        [link, setLink] = useState(initialLink || ""),
        [room, setRoom] = useState(initialLink ? meetingPlace(value) : String(value ?? ""));
    function emit(nextMode: typeof mode, nextLink: string, nextRoom: string) {
        const r = nextRoom.trim(),
            l = nextLink.trim();
        onChange(nextMode === "VIRTUAL" ? (r && l ? `${r} · ${l}` : l || r) : r);
    }
    const provider = isValidMeetingUrl(link) ? meetingProvider(link) : null;
    return (
        <fieldset className={styles.group} disabled={disabled}>
            <legend>Modalidad</legend>
            <div className={styles.segmented} role="radiogroup" aria-label="Modalidad">
                {(
                    [
                        ["PRESENCIAL", "Presencial", "En una sala u oficina"],
                        ["VIRTUAL", "Reunión virtual", "Teams, Meet, Zoom…"],
                    ] as const
                ).map(([key, label, hint]) => (
                    <label key={key} data-checked={mode === key || undefined}>
                        <input
                            type="radio"
                            name={id + "-modo"}
                            value={key}
                            checked={mode === key}
                            onChange={() => {
                                setMode(key);
                                emit(key, link, room);
                            }}
                        />
                        <span className={styles.glyph} aria-hidden="true">
                            {key === "VIRTUAL" ? (
                                <svg
                                    viewBox="0 0 24 24"
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="6" width="13" height="12" rx="2.5" />
                                    <path d="m16 10.5 5-3v9l-5-3" />
                                </svg>
                            ) : (
                                <svg
                                    viewBox="0 0 24 24"
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                                    <circle cx="12" cy="9.5" r="2.5" />
                                </svg>
                            )}
                        </span>
                        <span>
                            <strong>{label}</strong>
                            <small>{hint}</small>
                        </span>
                    </label>
                ))}
            </div>
            {mode === "VIRTUAL" ? (
                <>
                    <div className={styles.row}>
                        <label htmlFor={id + "-enlace"}>
                            Enlace de la reunión<span aria-label="obligatorio"> *</span>
                        </label>
                        <input
                            id={id + "-enlace"}
                            className={styles.input}
                            type="url"
                            inputMode="url"
                            required
                            maxLength={400}
                            placeholder="https://teams.microsoft.com/…"
                            value={link}
                            aria-describedby={id + "-enlace-ayuda"}
                            onChange={(e) => {
                                const v = e.target.value;
                                e.target.setCustomValidity(
                                    v && !isValidMeetingUrl(v)
                                        ? "Pega el enlace completo, empieza con https://"
                                        : "",
                                );
                                setLink(v);
                                emit(mode, v, room);
                            }}
                        />
                        <small
                            id={id + "-enlace-ayuda"}
                            className={styles.hint}
                            data-ok={provider ? true : undefined}
                        >
                            {provider
                                ? `✓ Enlace de ${provider}. Los participantes verán el botón «Unirse a la reunión».`
                                : "Copia el enlace desde la invitación de Teams, Meet o Zoom y pégalo aquí."}
                        </small>
                    </div>
                    <div className={styles.row}>
                        <label htmlFor={id + "-sala"}>Sala (solo si también hay personas presentes)</label>
                        <input
                            id={id + "-sala"}
                            className={styles.input}
                            maxLength={90}
                            placeholder="Ej.: Sala de juntas"
                            value={room}
                            onChange={(e) => {
                                setRoom(e.target.value);
                                emit(mode, link, e.target.value);
                            }}
                        />
                    </div>
                </>
            ) : (
                <div className={styles.row}>
                    <label htmlFor={id + "-lugar"}>Lugar</label>
                    <input
                        id={id + "-lugar"}
                        className={styles.input}
                        maxLength={200}
                        placeholder="Ej.: Sala de Informática, Sede central nivel 2"
                        value={room}
                        onChange={(e) => {
                            setRoom(e.target.value);
                            emit(mode, link, e.target.value);
                        }}
                    />
                </div>
            )}
        </fieldset>
    );
}
