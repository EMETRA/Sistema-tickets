"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { recoveryCode, recoveryEmail, recoveryPassword } from "@/auth/recovery-rules";
import Link from "next/link";
import { AccessLayout } from "@/components/client/templates/AccessLayout/AccessLayout";
import { FormField } from "@/components/client/molecules/FormField";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import styles from "./ForgotPassword.module.scss";

const codeSchema = z
    .object({
        otp: recoveryCode,
        password: recoveryPassword,
        repeatPassword: z.string().min(1, "Repite la contraseña nueva."),
    })
    .refine((v) => v.password === v.repeatPassword, {
        path: ["repeatPassword"],
        message: "Las contraseñas no coinciden.",
    });
type CodeValues = z.infer<typeof codeSchema>;

export default function ForgotPassword() {
    // Un formulario por paso; las reglas son las mismas que valida el servidor.
    const emailForm = useForm<{ email: string }>({
        resolver: zodResolver(z.object({ email: recoveryEmail })),
        defaultValues: { email: "" },
    });
    const codeForm = useForm<CodeValues>({
        resolver: zodResolver(codeSchema),
        defaultValues: { otp: "", password: "", repeatPassword: "" },
    });
    const [step, setStep] = useState<"email" | "code" | "done">("email");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const submitting = useRef(false);
    const send = async (body: object) => {
        if (submitting.current) return;
        setError("");
        submitting.current = true;
        setBusy(true);
        try {
            const response = await fetch("/api/auth/recovery", {
                method: step === "email" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(20000),
                body: JSON.stringify(body),
            });
            const data = (await response.json()) as { message?: string };
            if (!response.ok) throw new Error(data.message || "No se pudo completar la recuperación.");
            setMessage(data.message || "Solicitud procesada.");
            setStep(step === "email" ? "code" : "done");
            codeForm.reset({ otp: "", password: "", repeatPassword: "" });
        } catch (error) {
            setError(error instanceof Error ? error.message : "No se pudo completar la recuperación.");
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    };
    const submit =
        step === "email"
            ? emailForm.handleSubmit(({ email }) => send({ correo: email.trim() }))
            : codeForm.handleSubmit(({ otp, password }) => send({ OTP: otp, clave: password }));
    return (
        <AccessLayout>
            <div className={styles.header}>
                <span>Acceso institucional</span>
                <h2>{step === "done" ? "Acceso recuperado" : "Recuperar contraseña"}</h2>
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
                <form onSubmit={submit} noValidate className={styles.form}>
                    {step === "email" ? (
                        <FormField
                            label="Correo institucional"
                            htmlFor="recovery-email"
                            required
                            error={emailForm.formState.errors.email?.message}
                        >
                            <Input
                                id="recovery-email"
                                type="email"
                                autoComplete="email"
                                {...emailForm.register("email")}
                                readOnly={busy}
                                aria-invalid={!!emailForm.formState.errors.email}
                            />
                        </FormField>
                    ) : (
                        <>
                            <FormField
                                label="Código de recuperación"
                                htmlFor="recovery-code"
                                required
                                error={codeForm.formState.errors.otp?.message}
                            >
                                <Input
                                    id="recovery-code"
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    {...codeForm.register("otp", {
                                        setValueAs: (v) => String(v).replace(/[^0-9]/g, ""),
                                    })}
                                    readOnly={busy}
                                    aria-invalid={!!codeForm.formState.errors.otp}
                                />
                            </FormField>
                            <FormField
                                label="Nueva contraseña"
                                htmlFor="recovery-password"
                                required
                                error={codeForm.formState.errors.password?.message}
                            >
                                <Input
                                    id="recovery-password"
                                    type="password"
                                    autoComplete="new-password"
                                    maxLength={128}
                                    {...codeForm.register("password")}
                                    readOnly={busy}
                                    aria-invalid={!!codeForm.formState.errors.password}
                                />
                            </FormField>
                            <p className={styles.hint}>
                                Usa al menos 8 caracteres, mayúsculas, minúsculas, un número y un símbolo
                                (@$!%*?&amp;ñáéíóú).
                            </p>
                            <FormField
                                label="Repetir contraseña"
                                htmlFor="recovery-repeat"
                                required
                                error={codeForm.formState.errors.repeatPassword?.message}
                            >
                                <Input
                                    id="recovery-repeat"
                                    type="password"
                                    autoComplete="new-password"
                                    {...codeForm.register("repeatPassword")}
                                    readOnly={busy}
                                    aria-invalid={!!codeForm.formState.errors.repeatPassword}
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
                        {step === "email" ? "Solicitar recuperación" : "Actualizar contraseña"}
                    </Button>
                    {step === "code" && (
                        <button
                            type="button"
                            className={styles.retry}
                            disabled={busy}
                            onClick={() => {
                                setStep("email");
                                setMessage("");
                                codeForm.reset({ otp: "", password: "", repeatPassword: "" });
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
