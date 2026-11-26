"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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
    const [otp, setOtp] = useState("");
    const [clave, setClave] = useState("");
    const [confirmacion, setConfirmacion] = useState("");
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
            setOtp("");
        });
    }

    function confirmar(event: FormEvent) {
        event.preventDefault();
        if (clave !== confirmacion) {
            setError("Las contraseñas deben coincidir.");
            return;
        }
        void ejecutar(async () => {
            const data = await graphqlRequestClient<{ confirmarActivacionEmpleado: boolean }>(CONFIRMAR, {
                variables: { input: { tokenActivacion: token, otp, clave } },
            });
            if (!data.confirmarActivacionEmpleado) throw new Error("No se confirmó la activación.");
            salir(true);
        });
    }

    return (
        <AccessLayout>
            <div className={styles.formContainer}>
                <form onSubmit={confirmar} className={styles.activationForm}>
                    <header className={styles.headerContainer}>
                        <h2>Activa tu cuenta</h2>
                        <p className={styles.headerText}>
                            Confirma el correo <strong>{correo}</strong> y crea una contraseña nueva.
                        </p>
                    </header>
                    {token && (
                        <div className={styles.formFieldsContainer}>
                            <FormField label="Código de seis dígitos" htmlFor="activacion-codigo" required>
                                <Input
                                    id="activacion-codigo"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    required
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                    disabled={ocupado}
                                />
                            </FormField>
                            <FormField label="Nueva contraseña" htmlFor="activacion-clave" required>
                                <Input
                                    id="activacion-clave"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={10}
                                    maxLength={72}
                                    value={clave}
                                    onChange={(e) => setClave(e.target.value)}
                                    disabled={ocupado}
                                />
                            </FormField>
                            <FormField label="Confirma la contraseña" htmlFor="activacion-confirmar" required>
                                <Input
                                    id="activacion-confirmar"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={10}
                                    maxLength={72}
                                    value={confirmacion}
                                    onChange={(e) => setConfirmacion(e.target.value)}
                                    disabled={ocupado}
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
