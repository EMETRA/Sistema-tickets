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
import { login } from "@/api/graphql/mutations/login";
import styles from "./Login.module.scss";
import { useRouter } from "next/dist/client/components/navigation";

const Login: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await login({ email, password });
            console.log("Login exitoso:", response);
            router.push("/home");
        } catch (err) {
            console.error("Error en login:", err);
            setError("Error al iniciar sesión. Verifica tus credenciales.");

        } finally {
            setIsLoading(false);
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
                                    disabled={isLoading}
                                    required
                                />
                            </FormField>
                            <FormField htmlFor="password" label="Contraseña" required>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </FormField>
                            <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                            {error && (
                                <Text variant="caption" className={styles.errorText}>
                                    {error}
                                </Text>
                            )}
                        </div>
                        <FormActions className={styles.loginButton}>
                            <Button 
                                color="cancel" 
                                fullWidth 
                                type="submit"
                                state={isLoading ? "loading" : "default"}
                            >
                                {isLoading ? "Iniciando..." : "Iniciar Sesión"}
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