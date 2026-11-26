"use client";
import { useState } from "react";
import { meetingLink, meetingPlace, meetingProvider } from "@/platform/meeting";
import type { PlatformRecord } from "@/platform/types";
import { PersonChip, usePeopleNames } from "../../molecules/PeoplePicker";
import styles from "./MeetingFields.module.scss";

export function ParticipantChips({ ids }: { ids: number[] }) {
    const nameOf = usePeopleNames(ids);
    return (
        <ul className={styles.people} aria-label="Participantes">
            {ids.map((id) => (
                <li key={id}>
                    <PersonChip name={nameOf(id) || "Persona " + id} />
                </li>
            ))}
        </ul>
    );
}

/** Acceso directo a la reunión virtual en la ficha de la actividad. */
export function MeetingCard({ activity }: { activity: PlatformRecord }) {
    const link = meetingLink(activity.datos.lugar);
    const [copied, setCopied] = useState(false);
    if (!link) return null;
    const room = meetingPlace(activity.datos.lugar);
    const end = Date.parse(String(activity.datos.fin || ""));
    const finished = Number.isFinite(end) && end < Date.now();
    return (
        <section
            className={styles.meeting}
            aria-label="Reunión virtual"
            data-finished={finished || undefined}
        >
            <span className={styles.glyph} aria-hidden="true">
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="6" width="13" height="12" rx="2.5" />
                    <path d="m16 10.5 5-3v9l-5-3" />
                </svg>
            </span>
            <div className={styles.meetingText}>
                <strong>{finished ? "La reunión ya terminó" : "Reunión virtual"}</strong>
                <small>
                    {meetingProvider(link)}
                    {room ? ` · también en ${room}` : ""}
                </small>
            </div>
            <div className={styles.meetingActions}>
                <button
                    type="button"
                    className={styles.ghost}
                    onClick={() => {
                        void navigator.clipboard?.writeText(link).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        });
                    }}
                >
                    {copied ? "Enlace copiado" : "Copiar enlace"}
                </button>
                <a className={styles.join} href={link} target="_blank" rel="noreferrer noopener">
                    Unirse a la reunión
                    <span aria-hidden="true"> ↗</span>
                    <span className={styles.srOnly}> (se abre en otra pestaña)</span>
                </a>
            </div>
        </section>
    );
}
