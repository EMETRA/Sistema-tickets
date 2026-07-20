"use client";

import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { useRouter } from "next/navigation";
import styles from "./not-found.module.scss";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <Title variant="large">Página no encontrada</Title>
                <Text variant="caption">
                    La página que buscas no existe o la dirección es incorrecta.
                    Verifica la URL e intenta nuevamente.
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
