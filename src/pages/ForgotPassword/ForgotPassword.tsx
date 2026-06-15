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
import styles from "./ForgotPassword.module.scss";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Implementar llamada a API para recuperar contraseña
            await new Promise(resolve => setTimeout(resolve, 1000));
      
            console.log("Se ha enviado un correo con instrucciones para restablecer tu contraseña.");
            setEmail("");
        } catch (err) {
            console.error("Error al enviar correo:", err);
            console.log("Error al enviar el correo. Por favor intenta nuevamente.");
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
                            <Title variant="large">Recuperar Contraseña</Title>
                            <Text variant="caption" className={styles.headerText}>
                                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
                            </Text>
                        </div>
                        <div className={styles.formFieldsContainer}>
                            <FormField htmlFor="email" label="Correo Electrónico" required>
                                <Input 
                                    id="email"
                                    placeholder="tu-correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </FormField>
                            <Link href="/login" className={styles.backToLoginLink}>
                                Volver a iniciar sesión
                            </Link>
                        </div>
                        <FormActions className={styles.submitButton}>
                            <Button 
                                color="cancel" 
                                fullWidth 
                                type="submit"
                                state={isLoading ? "loading" : "default"}
                            >
                                {isLoading ? "Enviando..." : "Enviar"}
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

export default ForgotPassword;
