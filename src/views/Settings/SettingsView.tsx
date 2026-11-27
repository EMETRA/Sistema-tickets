"use client";
import Link from "next/link";
import { usePlatform } from "@/platform/context";
import {
    setAccessibility,
    setTheme,
    useAccessibility,
    useThemePreference,
    type TextSize,
    type ThemePreference,
} from "@/platform/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { startTour } from "@/platform/tour";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import styles from "./SettingsView.module.scss";

const THEMES: { id: ThemePreference; label: string; hint: string }[] = [
    { id: "light", label: "Claro", hint: "Fondo claro, ideal para oficinas iluminadas." },
    { id: "dark", label: "Oscuro", hint: "Reduce el brillo en ambientes con poca luz." },
    { id: "system", label: "Según el sistema", hint: "Sigue la apariencia de tu equipo y cambia sola." },
];

const TEXT_SIZES: { id: TextSize; label: string; hint: string; scale: number }[] = [
    { id: "normal", label: "Normal", hint: "Tamaño estándar", scale: 1 },
    { id: "large", label: "Grande", hint: "Un poco más grande", scale: 1.18 },
    { id: "xlarge", label: "Muy grande", hint: "Para leer sin esfuerzo", scale: 1.38 },
];

function Toggle({
    id,
    label,
    hint,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    hint: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className={styles.toggleRow}>
            <span className={styles.toggleText}>
                <strong id={id}>{label}</strong>
                <small id={id + "-ayuda"}>{hint}</small>
            </span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={id}
                aria-describedby={id + "-ayuda"}
                className={styles.switch}
                onClick={() => onChange(!checked)}
            >
                <span aria-hidden="true">{checked ? "Sí" : "No"}</span>
            </button>
        </div>
    );
}

/** Ajustes personales del panel: apariencia y accesos a la cuenta y a la administración. */
export function SettingsView() {
    const preference = useThemePreference();
    const a11y = useAccessibility();
    const customized = a11y.textSize !== "normal" || a11y.contrast !== "normal" || a11y.motion !== "system";
    const { data } = usePlatform();
    const role = useAuthStore((s) => s.getRole());
    const admin = data?.actor.admin || role === "ADMINISTRADOR";
    return (
        <div className={styles.settings}>
            <section className={styles.section} aria-labelledby="ajustes-apariencia">
                <header>
                    <h2 id="ajustes-apariencia">Apariencia</h2>
                    <p>
                        Elige cómo se ve el panel en este navegador. Se aplica al instante en todas las
                        pantallas.
                    </p>
                </header>
                <div className={styles.themes} role="radiogroup" aria-labelledby="ajustes-apariencia">
                    {THEMES.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="radio"
                            aria-checked={preference === t.id}
                            className={styles.theme}
                            onClick={() => setTheme(t.id)}
                        >
                            <span className={styles.preview} data-preview={t.id} aria-hidden="true">
                                <span className={styles.previewSide} />
                                <span className={styles.previewMain}>
                                    <span className={styles.previewBar} />
                                    <span className={styles.previewCards}>
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                </span>
                            </span>
                            <span className={styles.themeText}>
                                <strong>
                                    <span className={styles.radio} aria-hidden="true" />
                                    {t.label}
                                </strong>
                                <small>{t.hint}</small>
                            </span>
                        </button>
                    ))}
                </div>
                <p className={styles.note}>
                    La preferencia se guarda en este navegador; en otro equipo puedes elegir otra.
                </p>
            </section>

            <section className={styles.section} aria-labelledby="ajustes-lectura">
                <header>
                    <h2 id="ajustes-lectura">Lectura y accesibilidad</h2>
                    <p>Ajusta el panel para leerlo con comodidad. Los cambios se ven al momento.</p>
                </header>
                <div className={styles.group}>
                    <h3 id="ajustes-texto">Tamaño del texto</h3>
                    <div className={styles.sizes} role="radiogroup" aria-labelledby="ajustes-texto">
                        {TEXT_SIZES.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                role="radio"
                                aria-checked={a11y.textSize === t.id}
                                className={styles.size}
                                onClick={() => setAccessibility("textSize", t.id)}
                            >
                                <span
                                    className={styles.sample}
                                    style={{ fontSize: 22 * t.scale }}
                                    aria-hidden="true"
                                >
                                    Aa
                                </span>
                                <span className={styles.themeText}>
                                    <strong>
                                        <span className={styles.radio} aria-hidden="true" />
                                        {t.label}
                                    </strong>
                                    <small>{t.hint}</small>
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className={styles.note}>
                        Agranda textos, botones y espacios por igual, como el zoom del navegador.
                    </p>
                </div>
                <div className={styles.group}>
                    <Toggle
                        id="ajustes-contraste"
                        label="Alto contraste"
                        hint="Textos más oscuros, bordes más marcados y enlaces subrayados. Útil con reflejos en la pantalla o si te cuesta distinguir los textos grises."
                        checked={a11y.contrast === "more"}
                        onChange={(on) => setAccessibility("contrast", on ? "more" : "normal")}
                    />
                    <Toggle
                        id="ajustes-animaciones"
                        label="Reducir animaciones"
                        hint="Quita desplazamientos y transiciones. Si tu equipo ya lo pide, el panel lo respeta aunque esté apagado."
                        checked={a11y.motion === "reduce"}
                        onChange={(on) => setAccessibility("motion", on ? "reduce" : "system")}
                    />
                </div>
                {customized && (
                    <button
                        type="button"
                        className={styles.reset}
                        onClick={() => {
                            setAccessibility("textSize", "normal");
                            setAccessibility("contrast", "normal");
                            setAccessibility("motion", "system");
                        }}
                    >
                        Restablecer valores normales
                    </button>
                )}
            </section>

            <section className={styles.section} aria-labelledby="ajustes-recorrido">
                <div className={styles.toggleRow}>
                    <span className={styles.toggleText}>
                        <strong id="ajustes-recorrido">Recorrido guiado</strong>
                        <small>
                            Un paseo de un minuto por el menú, la búsqueda, los tickets y estos ajustes.
                            Puedes repetirlo las veces que quieras.
                        </small>
                    </span>
                    <button type="button" className={styles.reset} onClick={startTour}>
                        Ver recorrido
                    </button>
                </div>
            </section>

            <section className={styles.section} aria-labelledby="ajustes-cuenta">
                <header>
                    <h2 id="ajustes-cuenta">Tu cuenta</h2>
                    <p>Datos personales y avisos del panel.</p>
                </header>
                <div className={styles.links}>
                    <Link href="/mi-perfil">
                        <WorkspaceIcon name="user-solid" size={18} />
                        <span>
                            Mi perfil
                            <small>Tus datos, tu unidad y tus accesos.</small>
                        </span>
                    </Link>
                    <Link href="/notificaciones">
                        <WorkspaceIcon name="bell-regular" size={18} />
                        <span>
                            Notificaciones
                            <small>Avisos del panel y de tus solicitudes.</small>
                        </span>
                    </Link>
                </div>
            </section>

            {admin && (
                <section className={styles.section} aria-labelledby="ajustes-admin">
                    <header>
                        <h2 id="ajustes-admin">Administración</h2>
                        <p>Configuración institucional que afecta a todos los colaboradores.</p>
                    </header>
                    <div className={styles.links}>
                        <Link href="/espacio/accesos">
                            <WorkspaceIcon name="user-lock-solid" size={18} />
                            <span>
                                Personas y accesos
                                <small>Perfiles, roles y permisos de cada colaborador.</small>
                            </span>
                        </Link>
                        <Link href="/espacio/solicitudes">
                            <WorkspaceIcon name="user-lock-solid" size={18} />
                            <span>
                                Solicitudes de acceso
                                <small>Peticiones de acceso y de cuentas nuevas.</small>
                            </span>
                        </Link>
                        <Link href="/espacio/organizacion">
                            <WorkspaceIcon name="people-group-solid" size={18} />
                            <span>
                                Personal y equipos
                                <small>Equipos de trabajo y responsabilidades.</small>
                            </span>
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}
export default SettingsView;
