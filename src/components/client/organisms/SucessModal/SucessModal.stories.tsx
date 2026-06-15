import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import SuccessModal from "./SucessModal";
import { Button } from "../../atoms/Button";
import type { SuccessModalProps } from "./types";

const meta = {
    title: "Organisms/SuccessModal",
    component: SuccessModal,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        isOpen: {
            control: "boolean",
            description: "Controla si el modal está abierto",
        },
        title: {
            control: "text",
            description: "Título del modal",
        },
        message: {
            control: "text",
            description: "Mensaje del modal",
        },
    },
} satisfies Meta<typeof SuccessModal>;

export default meta;

// Componente wrapper con interactividad - Abre con botón
const ModalWithButton: React.FC<Omit<SuccessModalProps, "isOpen" | "onClose">> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <Button variant="contained" color="default" onClick={() => setIsOpen(true)}>
                Abrir Modal
            </Button>
            <SuccessModal
                {...(props as SuccessModalProps)}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </div>
    );
};

type Story = StoryObj<Omit<SuccessModalProps, "isOpen" | "onClose">>;

export const Default: Story = {
    args: {
        title: "Éxito",
        message: "Operación realizada con éxito.",
    } as Omit<SuccessModalProps, "isOpen" | "onClose">,
    render: (args) => <ModalWithButton {...args} />,
};

export const TicketCreated: Story = {
    args: {
        title: "Ticket Creado",
        message: "El ticket ha sido creado exitosamente en el sistema.",
    } as Omit<SuccessModalProps, "isOpen" | "onClose">,
    render: (args) => <ModalWithButton {...args} />,
};

export const PermissionAssigned: Story = {
    args: {
        title: "Permiso Asignado",
        message: "El permiso ha sido asignado correctamente al usuario.",
    } as Omit<SuccessModalProps, "isOpen" | "onClose">,
    render: (args) => <ModalWithButton {...args} />,
};

export const ChangesApplied: Story = {
    args: {
        title: "Cambios Aplicados",
        message: "Los cambios han sido guardados exitosamente.",
    } as Omit<SuccessModalProps, "isOpen" | "onClose">,
    render: (args) => <ModalWithButton {...args} />,
};
