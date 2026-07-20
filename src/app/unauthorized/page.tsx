"use client";

import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { useRouter } from "next/navigation";
import styles from "./Unauthorized.module.scss";

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <Title variant="large">Acceso no autorizado</Title>
                <Text variant="caption">
                    No tienes permisos para visualizar esta página. Si crees que se trata
                    de un error, contacta al administrador.
                </Text>
                <Button
                    type="button"
                    color="cancel"
                    onClick={() => router.push("/home")}
                >
                    Volver al inicio
                </Button>
            </div>
        </div>
    );
}
