"use client";

import React from "react";
import { WelcomeMessageProps } from "./types";
import styles from "./WelcomeMessage.module.scss";
import { Title } from "../../atoms/Title";
import { Text } from "../../atoms/Text";


export const WelcomeMessage = ({ userName }: WelcomeMessageProps) => {
    return (
        <div className={styles.container}>
            <Title variant="mid" className={styles.header}>
                Bienvenido,{'   '}
                <Text className={styles.name}>
                    {userName}
                </Text>
            </Title>
            <Text variant="caption">
                Bienvenido, al sistema de tickets 
            </Text>
            <Text variant="body" className={styles.description}>
                Esta plataforma fue especialmente diseñada para poder llevar un control de todas tus solicitudes realizadas al departamento de informatica EMETRA.
            </Text>
        </div>
    )
}

export default WelcomeMessage