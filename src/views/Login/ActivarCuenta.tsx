"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mensajes } from "@/platform/forms";
import { graphqlRequestClient } from "@/api/graphql/client";
import { AccessLayout } from "@/components/client/templates/AccessLayout/AccessLayout";
import { FormField } from "@/components/client/molecules/FormField";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import styles from "./Login.module.scss";

const SOLICITAR = `mutation SolicitarActivacionEmpleado($input: SolicitarActivacionEmpleadoInput!) {
    solicitarActivacionEmpleado(input: $input) { tokenActivacion venceEnSegundos reenviarEnSegundos }
}`;
const CONFIRMAR = `mutation ConfirmarActivacionEmpleado($input: ConfirmarActivacionEmpleadoInput!) {
    confirmarActivacionEmpleado(input: $input)
}`;

// Reglas que se muestran en pantalla: código de 6 dígitos y contraseña de 10 a 72 caracteres.
const activacionSchema = z
    .object({
        otp: z.string().regex(/^\d{6}$/, "Escribe los 6 dígitos del código que recibiste."),
        clave: z
            .string()
            .min(10, "La contraseña necesita al menos 10 caracteres.")
            .max(72, "La contraseña admite hasta 72 caracteres."),
        confirmacion: z.string().min(1, mensajes.requerido("Confirma la contraseña")),
    })
    .refine((v) => v.clave === v.confirmacion, {
        path: ["confirmacion"],
        message: "Las contraseñas deben coincidir.",
    });
type ActivacionValues = z.infer<typeof activacionSchema>;

export function ActivarCuenta({
    correo,
    claveTemporal,
    salir,
}: {
    correo: string;
    claveTemporal: string;
    salir: (completado: boolean) => void;
}) {
    const [token, setToken] = useState("");
    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors },
    } = useForm<ActivacionValues>({
        resolver: zodResolver(activacionSchema),
        defaultValues: { otp: "", clave: "", confirmacion: "" },
    });
    const [error, setError] = useState("");
    const [ocupado, setOcupado] = useState(false);
    const [espera, setEspera] = useState(0);
    const enCurso = useRef(false);

    useEffect(() => {
        if (!espera) return;
        const timer = setTimeout(() => setEspera((segundos) => Math.max(0, segundos - 1)), 1000);
        return () => clearTimeout(timer);
    }, [espera]);

    async function ejecutar(accion: () => Promise<void>) {
        if (enCurso.current) return;
        enCurso.current = true;
        setError("");
        setOcupado(true);
        try {
            await accion();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Intenta nuevamente.");
        } finally {
            enCurso.current = false;
            setOcupado(false);
        }
    }

    function solicitar() {
        if (espera) return;
        void ejecutar(async () => {
            const data = await graphqlRequestClient<{
                solicitarActivacionEmpleado: { tokenActivacion: string; reenviarEnSegundos: number };
            }>(SOLICITAR, { variables: { input: { correo: correo.trim().toLowerCase(), claveTemporal } } });
            setToken(data.solicitarActivacionEmpleado.tokenActivacion);
            setEspera(data.solicitarActivacionEmpleado.reenviarEnSegundos);
            resetField("otp");
        });
    }

    const confirmar = handleSubmit(({ otp, clave }) => {
        void ejecutar(async () => {
            const data = await graphqlRequestClient<{ confirmarActivacionEmpleado: boolean }>(CONFIRMAR, {
                variables: { input: { tokenActivacion: token, otp, clave } },
            });
            if (!data.confirmarActivacionEmpleado) throw new Error("No se confirmó la activación.");
            salir(true);
        });
    });

    return (
        <AccessLayout>
            <div className={styles.formContainer}>
                <form onSubmit={confirmar} noValidate className={styles.activationForm}>
                    <header className={styles.headerContainer}>
                        <h2>Activa tu cuenta</h2>
                        <p className={styles.headerText}>
                            Confirma el correo <strong>{correo}</strong> y crea una contraseña nueva.
                        </p>
                    </header>
                    {token && (
                        <div className={styles.formFieldsContainer}>
                            <FormField
                                label="Código de seis dígitos"
                                htmlFor="activacion-codigo"
                                required
                                error={errors.otp?.message}
                            >
                                <Input
                                    id="activacion-codigo"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    maxLength={6}
                                    {...register("otp", {
                                        setValueAs: (v) => String(v).replace(/[^0-9]/g, ""),
                                    })}
                                    readOnly={ocupado}
                                    aria-invalid={!!errors.otp}
                                />
                            </FormField>
                            <FormField
                                label="Nueva contraseña"
                                htmlFor="activacion-clave"
                                required
                                error={errors.clave?.message}
                            >
                                <Input
                                    id="activacion-clave"
                                    type="password"
                                    autoComplete="new-password"
                                    maxLength={72}
                                    {...register("clave")}
                                    readOnly={ocupado}
                                    aria-invalid={!!errors.clave}
                                />
                            </FormField>
                            <FormField
                                label="Confirma la contraseña"
                                htmlFor="activacion-confirmar"
                                required
                                error={errors.confirmacion?.message}
                            >
                                <Input
                                    id="activacion-confirmar"
                                    type="password"
                                    autoComplete="new-password"
                                    maxLength={72}
                                    {...register("confirmacion")}
                                    readOnly={ocupado}
                                    aria-invalid={!!errors.confirmacion}
                                />
                            </FormField>
                            <p className={styles.headerText}>
                                El código vence en 10 minutos. Usa al menos 10 caracteres.
                            </p>
                        </div>
                    )}
                    {error && (
                        <p role="alert" className={styles.errorText}>
                            {error}
                        </p>
                    )}
                    <div className={styles.activationActions}>
                        {token && (
                            <Button type="submit" state={ocupado ? "disabled" : "default"}>
                                Activar cuenta
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant={token ? "outlined" : "contained"}
                            onClick={solicitar}
                            state={ocupado || espera > 0 ? "disabled" : "default"}
                        >
                            {espera ? `Reenviar en ${espera} s` : token ? "Reenviar código" : "Enviar código"}
                        </Button>
                        <Button
                            type="button"
                            variant="text"
                            state={ocupado ? "disabled" : "default"}
                            onClick={() => salir(false)}
                        >
                            Volver
                        </Button>
                    </div>
                </form>
            </div>
        </AccessLayout>
    );
}
