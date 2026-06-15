"use client";

import React, { useEffect, useRef } from "react";

import { MessageText } from "@/components/client/molecules/MessageText";
import { SendMessage } from "@/components/client/molecules/SendMessage";

import styles from "./Chat.module.scss";
import { ChatProps } from "./types";

import { useGetTicketMessages } from "@/api/hooks";
import { useSendTicketMessage } from "@/api/hooks";
import { useAuthStore } from "@/store/useAuthStore";

const Chat: React.FC<ChatProps> = ({ ticketId, classname }) => {
    const userId = useAuthStore((state) => state.getUserId());
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { data: ticketMessages, loading: isTicketMessagesLoading, refetch } = useGetTicketMessages(ticketId);
    const { sendMessage, loading: isSending } = useSendTicketMessage();

    useEffect(() => {
        if (messagesContainerRef.current && ticketMessages.length > 0) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [ticketMessages]);

    const onFileClick = (url_descarga: string) => {
        window.open(url_descarga, "_blank");
    }

    const handleSendMessage = async (message: string, files: File[]) => {
        if (!message.trim()) return;

        try {
            await sendMessage(
                {
                    ticketId: Number(ticketId),
                    usuarioId: Number(userId),
                    textoMensaje: message,
                },
                files.length > 0 ? files : undefined
            );
            await refetch();
        } catch (err) {
            console.error("Error al enviar mensaje:", err);
        }
    }

    return (
        <div className={`${styles.chatContainer} ${classname}`}>
            <div className={styles.messagesContainer} ref={messagesContainerRef}>
                {isTicketMessagesLoading ? (
                    <p>Cargando mensajes...</p>
                ) : ticketMessages.length === 0 ? (
                    <p>No hay mensajes para mostrar.</p>
                ) : (
                    ticketMessages.map((message, index) => (
                        <MessageText
                            key={index}
                            text={message.textoMensaje}
                            files={
                                message.archivos.map((archivo) => ({
                                    id: archivo.id,
                                    name: archivo.nombreArchivo || "Archivo adjunto",
                                    onClick: () => onFileClick(archivo.url_descarga || "")
                                }))
                            }
                            timestamp={message.fechaEnvio}
                            userName={message.nombre_usuario}
                            avatarProps={{ initials: message.nombre_usuario.charAt(0).toUpperCase() + (message.nombre_usuario.split(" ")[1]?.charAt(0).toUpperCase() || "") }}
                        />
                    ))
                )}
            </div>
            <SendMessage
                onSend={handleSendMessage}
                className={styles.inputContainer}
                disabled={isSending}
            />
        </div>
    );
}

export default Chat;