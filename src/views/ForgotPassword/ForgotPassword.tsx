"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { AccessLayout } from "@/components/client/templates/AccessLayout/AccessLayout";
import { FormField } from "@/components/client/molecules/FormField";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import styles from "./ForgotPassword.module.scss";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [step, setStep] = useState<"email" | "code" | "done">("email");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const submitting = useRef(false);
    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current) return;
        setError("");
        if (step === "code" && password !== repeatPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        submitting.current = true;
        setBusy(true);
        try {
            const response = await fetch("/api/auth/recovery", {
                method: step === "email" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(20000),
                body: JSON.stringify(
                    step === "email"
                        ? { correo: email.trim() }
                        : { OTP: otp, clave: password },
                ),
            });
            const data = (await response.json()) as { message?: string };
            if (!response.ok)
                throw new Error(
                    data.message || "No se pudo completar la recuperación.",
                );
            setMessage(data.message || "Solicitud procesada.");
            setStep(step === "email" ? "code" : "done");
            setPassword("");
            setRepeatPassword("");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo completar la recuperación.",
            );
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    };
    return (
        <AccessLayout>
            <div className={styles.header}>
                <span>Acceso institucional</span>
                <h2>
                    {step === "done" ? "Acceso recuperado" : "Recuperar contraseña"}
                </h2>
                <p>
                    {step === "email"
                        ? "Solicita un código para restablecer tu acceso con tu correo institucional."
                        : step === "code"
                            ? "Escribe el código recibido y una nueva contraseña."
                            : "Regresa al inicio de sesión para ingresar con tu nueva contraseña."}
                </p>
            </div>
            {message && (
                <p className={styles.message} role="status">
                    {message}
                </p>
            )}
            {step !== "done" && (
                <form onSubmit={submit} className={styles.form}>
                    {step === "email" ? (
                        <FormField
                            label="Correo institucional"
                            htmlFor="recovery-email"
                            required
                        >
                            <Input
                                id="recovery-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                disabled={busy}
                            />
                        </FormField>
                    ) : (
                        <>
                            <FormField
                                label="Código de recuperación"
                                htmlFor="recovery-code"
                                required
                            >
                                <Input
                                    id="recovery-code"
                                    value={otp}
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    onChange={(event) => setOtp(event.target.value)}
                                    required
                                    disabled={busy}
                                />
                            </FormField>
                            <FormField
                                label="Nueva contraseña"
                                htmlFor="recovery-password"
                                required
                            >
                                <Input
                                    id="recovery-password"
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    maxLength={128}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    disabled={busy}
                                />
                            </FormField>
                            <p className={styles.hint}>
                                Usa al menos 8 caracteres, mayúsculas, minúsculas, un número y
                                un símbolo (@$!%*?&amp;ñáéíóú).
                            </p>
                            <FormField
                                label="Repetir contraseña"
                                htmlFor="recovery-repeat"
                                required
                            >
                                <Input
                                    id="recovery-repeat"
                                    type="password"
                                    autoComplete="new-password"
                                    value={repeatPassword}
                                    onChange={(event) => setRepeatPassword(event.target.value)}
                                    required
                                    disabled={busy}
                                />
                            </FormField>
                        </>
                    )}
                    {error && (
                        <p role="alert" className={styles.error}>
                            {error}
                        </p>
                    )}
                    <Button fullWidth type="submit" state={busy ? "loading" : "default"}>
                        {step === "email"
                            ? "Solicitar recuperación"
                            : "Actualizar contraseña"}
                    </Button>
                    {step === "code" && (
                        <button
                            type="button"
                            className={styles.retry}
                            disabled={busy}
                            onClick={() => {
                                setStep("email");
                                setMessage("");
                                setOtp("");
                                setPassword("");
                                setRepeatPassword("");
                            }}
                        >
                            Solicitar otro código
                        </button>
                    )}
                </form>
            )}
            <Link href="/login" className={styles.back}>
                Volver a iniciar sesión
            </Link>
        </AccessLayout>
    );
}
