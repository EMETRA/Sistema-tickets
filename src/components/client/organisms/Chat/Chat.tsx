
import React, { useEffect, useRef } from "react";

import { MessageText } from "@/components/client/molecules/MessageText";
import { SendMessage } from "@/components/client/molecules/SendMessage";

import styles from "./Chat.module.scss";
import { ChatProps } from "./types";

import type { MessageTextProps } from "@/components/client/molecules/MessageText";

const Chat: React.FC<ChatProps> = ({ ticketId, classname }) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, []);

    const onFileClick = (fileId: string) => {
        alert("Archivo clickeado: " + fileId);
    }

    const handleSendMessage = (message: string, files: File[]) => {
        alert("Mensaje enviado: " + message + " con " + files.length + " archivos adjuntos.");
    }

    const messages: MessageTextProps[] = [
        {
            userName: "Juan Pérez",
            text: "Hola, tengo un problema con mi pedido.",
            timestamp: "2024-06-01T10:00:00Z",
            avatarProps: {
                src: "/images/city.png",
            },
            files: [
                {
                    id: "file1",
                    name: "captura_pantalla.png",
                    onClick: onFileClick
                }
            ]
        },
        {
            userName: "Soporte Técnico",
            text: "Hola Juan, ¿podrías proporcionar más detalles sobre el problema?",
            timestamp: "2024-06-01T10:05:00Z",
            avatarProps: {
                src: "/images/logo-emetra.svg",
            },
        },
        {
            userName: "Juan Pérez",
            text: "Claro, el pedido llegó con un producto dañado.",
            timestamp: "2024-06-01T10:10:00Z",
            avatarProps: {
                src: "/images/city.png",
            },
        },
        {
            userName: "Soporte Técnico",
            text: "Lamentamos el inconveniente. Vamos a procesar un reemplazo para ti.",
            timestamp: "2024-06-01T10:15:00Z",
            avatarProps: {
                src: "/images/logo-emetra.svg",
            },
        },
        {
            userName: "Juan Pérez",
            text: "Gracias por la ayuda, espero que el reemplazo llegue pronto.",
            timestamp: "2024-06-01T10:20:00Z",
            avatarProps: {
                src: "/images/city.png",
            },
        },
        {
            userName: "Juan Pérez",
            text: "Hola, tengo un problema con mi pedido.",
            timestamp: "2024-06-01T10:00:00Z",
            avatarProps: {
                src: "/images/city.png",
            },
            files: [
                {
                    id: "file1",
                    name: "captura_pantalla.png",
                    onClick: onFileClick
                }
            ]
        },
        {
            userName: "Soporte Técnico",
            text: "Hola Juan, ¿podrías proporcionar más detalles sobre el problema?",
            timestamp: "2024-06-01T10:05:00Z",
            avatarProps: {
                src: "/images/logo-emetra.svg",
            },
        },
        {
            userName: "Juan Pérez",
            text: "Claro, el pedido llegó con un producto dañado.",
            timestamp: "2024-06-01T10:10:00Z",
            avatarProps: {
                src: "/images/city.png",
            },
        },
        {
            userName: "Soporte Técnico",
            text: "Lamentamos el inconveniente. Vamos a procesar un reemplazo para ti.",
            timestamp: "2024-06-01T10:15:00Z",
            avatarProps: {
                src: "/images/logo-emetra.svg",
            },
        },
        {
            userName: "Juan Pérez",
            text: "Gracias por la ayuda, espero que el reemplazo llegue pronto.",
            timestamp: "2024-06-01T10:20:00Z",
            avatarProps: {
                src: "/images/city.png",
            },
        }
    ];



    return (
        <div className={`${styles.chatContainer} ${classname}`} >
            <div className={styles.messagesContainer} ref={messagesContainerRef}>
                {messages.map((message, index) => (
                    <MessageText key={index} {...message} />
                ))}
            </div>
            <SendMessage onSend={handleSendMessage} className={styles.inputContainer} />
        </div>
    );
}

export default Chat;
