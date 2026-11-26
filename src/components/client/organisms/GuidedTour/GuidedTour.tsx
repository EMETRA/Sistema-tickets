"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TourStep } from "@/config/guided-tour";
import { measureUiScale } from "@/platform/theme";
import styles from "./GuidedTour.module.scss";

const GAP = 14;
const PAD = 6;

/** Elemento visible en pantalla para el selector (o null si no aplica). */
function findTarget(selector?: string) {
    if (!selector) return null;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    if (r.right < 0 || r.left > window.innerWidth) return null;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return null;
    return el;
}

/**
 * Recorrido guiado: oscurece la pantalla, resalta un elemento y explica para
 * qué sirve. Se maneja con mouse, teclado (← → Esc) o lector de pantalla.
 * Los pasos sin elemento visible se omiten; los pasos sin `target` se centran.
 */
export function GuidedTour({
    steps,
    open,
    onClose,
}: {
    steps: TourStep[];
    open: boolean;
    /** `completed` es false si la persona eligió «Saltar recorrido». */
    onClose: (completed: boolean) => void;
}) {
    // Cada apertura monta el recorrido de nuevo: pasos y posición desde cero.
    return open ? <TourDialog steps={steps} onClose={onClose} /> : null;
}

function TourDialog({ steps, onClose }: { steps: TourStep[]; onClose: (completed: boolean) => void }) {
    const dialog = useRef<HTMLDialogElement>(null),
        card = useRef<HTMLDivElement>(null),
        spot = useRef<HTMLDivElement>(null),
        shade = useRef<HTMLDivElement>(null),
        next = useRef<HTMLButtonElement>(null);
    // Pasos que aplican en esta pantalla (se calcula una vez, al abrir).
    const [available] = useState(() => steps.filter((s) => !s.target || findTarget(s.target)));
    const [index, setIndex] = useState(0);
    const step = available[index];
    const last = index === available.length - 1;

    useEffect(() => {
        const d = dialog.current;
        if (d && !d.open) d.showModal();
        // showModal enfoca el diálogo: llevar el foco al botón principal.
        const timer = setTimeout(() => next.current?.focus(), 80);
        return () => {
            clearTimeout(timer);
            if (d?.open) d.close();
        };
    }, []);

    /** Coloca el resaltado y la tarjeta (estilos directos: sin re-render). */
    const place = useCallback(() => {
        const c = card.current,
            sp = spot.current,
            sh = shade.current;
        if (!step || !c || !sp || !sh) return;
        const { scale } = measureUiScale();
        const vw = window.innerWidth / scale,
            vh = window.innerHeight / scale;
        const el = findTarget(step.target);
        const cw = c.offsetWidth || 360,
            ch = c.offsetHeight || 220;
        if (!el) {
            sp.hidden = true;
            sh.dataset.full = "true";
            c.style.left = Math.max(16, (vw - cw) / 2) + "px";
            c.style.top = Math.max(16, (vh - ch) / 2) + "px";
            c.style.visibility = "visible";
            return;
        }
        const r = el.getBoundingClientRect();
        const box = {
            left: r.left / scale - PAD,
            top: r.top / scale - PAD,
            width: r.width / scale + PAD * 2,
            height: r.height / scale + PAD * 2,
        };
        sp.hidden = false;
        delete sh.dataset.full;
        Object.assign(sp.style, {
            left: box.left + "px",
            top: box.top + "px",
            width: box.width + "px",
            height: box.height + "px",
        });
        const clampX = (x: number) => Math.min(Math.max(16, x), vw - cw - 16);
        const clampY = (y: number) => Math.min(Math.max(16, y), vh - ch - 16);
        let left: number, top: number;
        if (box.left + box.width + GAP + cw <= vw - 16) {
            left = box.left + box.width + GAP;
            top = clampY(box.top + box.height / 2 - ch / 2);
        } else if (box.top + box.height + GAP + ch <= vh - 16) {
            left = clampX(box.left + box.width / 2 - cw / 2);
            top = box.top + box.height + GAP;
        } else if (box.left - GAP - cw >= 16) {
            left = box.left - GAP - cw;
            top = clampY(box.top + box.height / 2 - ch / 2);
        } else {
            left = clampX(box.left + box.width / 2 - cw / 2);
            top = clampY(box.top - GAP - ch);
        }
        c.style.left = left + "px";
        c.style.top = top + "px";
        c.style.visibility = "visible";
    }, [step]);

    useLayoutEffect(() => {
        if (!step) return;
        findTarget(step.target)?.scrollIntoView({ block: "nearest", inline: "nearest" });
        place();
        next.current?.focus();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
        };
    }, [step, place]);

    return (
        <dialog
            ref={dialog}
            className={styles.tour}
            aria-labelledby="recorrido-titulo"
            aria-describedby="recorrido-texto"
            onCancel={(e) => {
                e.preventDefault();
                onClose(false);
            }}
            onKeyDown={(e) => {
                if (e.key === "ArrowRight" && !last) setIndex((i) => i + 1);
                if (e.key === "ArrowLeft" && index > 0) setIndex((i) => i - 1);
            }}
        >
            <div ref={shade} className={styles.shade} data-full="true" aria-hidden="true" />
            <div ref={spot} className={styles.spot} aria-hidden="true" hidden />
            {step && (
                <div ref={card} className={styles.card} style={{ visibility: "hidden" }}>
                    <p className={styles.count} aria-live="polite">
                        Paso {index + 1} de {available.length}
                    </p>
                    <h2 id="recorrido-titulo">{step.title}</h2>
                    <p id="recorrido-texto" className={styles.body}>
                        {step.body}
                    </p>
                    <div className={styles.dots} aria-hidden="true">
                        {available.map((s, i) => (
                            <span key={s.id} data-done={i < index || undefined} data-current={i === index || undefined} />
                        ))}
                    </div>
                    <div className={styles.actions}>
                        {!last && (
                            <button type="button" className={styles.skip} onClick={() => onClose(false)}>
                                Saltar recorrido
                            </button>
                        )}
                        <span className={styles.spacer} />
                        {index > 0 && (
                            <button type="button" className={styles.secondary} onClick={() => setIndex((i) => i - 1)}>
                                Anterior
                            </button>
                        )}
                        <button
                            ref={next}
                            type="button"
                            className={styles.primary}
                            onClick={() => (last ? onClose(true) : setIndex((i) => i + 1))}
                        >
                            {last ? "Terminar" : index === 0 ? "Empezar" : "Siguiente"}
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    );
}
export default GuidedTour;
