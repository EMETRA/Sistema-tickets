"use client";

import { useState } from "react";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { FormField } from "@/components/client/molecules/FormField";
import { FormActions } from "@/components/client/molecules/FormActions";
import { Input } from "@/components/client/atoms/Input";
import { Button } from "@/components/client/atoms/Button";
import { Link } from "@/components/client/atoms/Link";
import { Image } from "@/components/client/atoms/Image";
import { useLogin } from "@/api/hooks/useLogin";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/api/graphql/client";
import styles from "./Login.module.scss";
import { useRouter } from "next/dist/client/components/navigation";
import type { UsuarioPerfil } from "@/api/graphql/home/types";

const Login: React.FC = () => {
    const router = useRouter();
    const { loading, error: loginError, login } = useLogin();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [email, setEmail] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtener información del usuario desde el backend
     * El token se envía automáticamente via apiFetch
     */
    const fetchUserInfo = async (): Promise<UsuarioPerfil | null> => {
        try {
            const response = await apiFetch<{ usuario: UsuarioPerfil }>(
                "/api/usuario"
            );
            return response.usuario || null;
        } catch {
            return null;
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await login(email, clave);

            let userInfo = await fetchUserInfo();

            // DUMMY: En desarrollo, si el backend retorna null, usar datos de prueba
            if (process.env.NODE_ENV === "development") {
                // Descomentar para usar este dummy cuando el backend retorne null:
                userInfo = {
                    id_usuario: userInfo?.id_usuario || "999",
                    nombre: userInfo?.nombre || "Juan Perez",
                    email: email,
                    rol: "tech",
                    departamento: userInfo?.departamento || "Desarrollo",
                    avatar: userInfo?.avatar || undefined,
                };
            }

            if (!userInfo) {
                setError("Ocurrió un error. Intenta nuevamente.");
                return;
            }

            const userRole = userInfo.rol || "USER";
            const normalizedUser: UsuarioPerfil = {
                ...userInfo,
                rol: userRole,
            };

            setAuth(response.token, normalizedUser);
            
            router.push("/home");
        } catch (err) {
            console.error("Error en login:", err);
            setError("Error al iniciar sesión. Verifica tus credenciales.");
        }
    };

    return(
        <div className={styles.mainContainer}>
            <Title variant="xlarge" className={styles.title}>EMETRA</Title>
            <div className={styles.contentContainer}>
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.headerContainer}>
                            <Title variant="large">Iniciar Sesión</Title>
                            <Text variant="caption" className={styles.headerText}>Bienvenido ingresa tus credenciales para acceder</Text>
                        </div>
                        <div className={styles.formFieldsContainer}>
                            <FormField htmlFor="email" label="Usuario" required>
                                <Input 
                                    id="email"
                                    placeholder="email@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </FormField>
                            <FormField htmlFor="clave" label="Contraseña" required>
                                <Input 
                                    id="clave" 
                                    type="password" 
                                    placeholder="Contraseña"
                                    value={clave}
                                    onChange={(e) => setClave(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </FormField>
                            <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                            {(loginError || error) && (
                                <Text variant="caption" className={styles.errorText}>
                                    {error || loginError}
                                </Text>
                            )}
                        </div>
                        <FormActions className={styles.loginButton}>
                            <Button 
                                color="cancel" 
                                fullWidth 
                                type="submit"
                                state={loading ? "loading" : "default"}
                            >
                                {loading ? "Iniciando..." : "Iniciar Sesión"}
                            </Button>
                        </FormActions>
                    </form>
                </div>
                <div className={styles.infoContainer}>
                    <Title variant="xlarge">Sistema de tickets EMETRA</Title>
                    <Text variant="caption" className={styles.infoText}>
                        Un sistema diseñado especialmente para ti para facilitarte el control de tus procesos de la mejor manera.
                    </Text>
                    <Image src="/images/login-info.png" alt="Información del sistema" width={1041} height={586} rounded={false} />
                </div>
            </div>
        </div>
    );
};

export default Login;