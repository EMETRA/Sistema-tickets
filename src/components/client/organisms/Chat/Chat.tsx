
import React, { useEffect, useRef } from "react";

import { MessageText } from "@/components/client/molecules/MessageText";
import { SendMessage } from "@/components/client/molecules/SendMessage";

import styles from "./Chat.module.scss";
import { ChatProps } from "./types";

import { useGetTicketMessages } from "@/api/hooks";

const Chat: React.FC<ChatProps> = ({ ticketId, classname }) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { data: ticketMessages, loading: isTicketMessagesLoading } = useGetTicketMessages(ticketId);

    useEffect(() => {
        if (messagesContainerRef.current && ticketMessages.length > 0) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [ticketMessages]);

    const onFileClick = (fileId: string) => {
        alert("Archivo clickeado: " + fileId);
    }

    const handleSendMessage = (message: string, files: File[]) => {
        alert("Mensaje enviado: " + message + " con " + files.length + " archivos adjuntos.");
    }

    return (
        <div className={`${styles.chatContainer} ${classname}`} >
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
                                    onClick: onFileClick
                                }))
                            }
                            timestamp={message.fechaEnvio}
                            // Datos quemados, ya que el backend no los está enviando. Cambios solicitados.
                            userName="usuario"
                            avatarProps={{ initials: "US" }}
                        />
                    ))
                )}
            </div>
            <SendMessage onSend={handleSendMessage} className={styles.inputContainer} />
        </div>
    );
}

export default Chat;
