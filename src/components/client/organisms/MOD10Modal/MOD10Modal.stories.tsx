import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import MOD10Modal from "./MOD10Modal";
import { Button } from "../../atoms/Button";
import type { UploadedFile } from "../TicketCreationPanel/types";
import type { casesNotificationFormData } from "../../../../pages/MOD10";
import type { MOD10ModalProps } from "./types";

const meta = {
    title: "Organisms/MOD10Modal",
    component: MOD10Modal,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        isOpen: {
            control: "boolean",
            description: "Controla si el modal está abierto",
        },
        destinyArea: {
            control: "text",
            description: "Área destino (email)",
        },
        documentDate: {
            control: "text",
            description: "Fecha del documento",
        },
        issuedBy: {
            control: "text",
            description: "Emitido por",
        },
        caseNumber: {
            control: "text",
            description: "Número de expediente",
        },
        pageNumbers: {
            control: "number",
            description: "Número de folios",
        },
        name: {
            control: "text",
            description: "Nombre del caso o asunto",
        },
        reference: {
            control: "text",
            description: "Referencia o descripción adicional",
        },
    },
} satisfies Meta<typeof MOD10Modal>;

export default meta;

// Mock de UploadedFile
const mockUploadedFile: UploadedFile = {
    id: 1,
    name: "notificacion_oficial.pdf",
    status: "ready",
    progress: 100,
    file: new File(["mock pdf content"], "notificacion_oficial.pdf", { type: "application/pdf" }),
};

// Datos base para las stories
const baseData = {
    destinyArea: "hgodoy@muniguate.com",
    documentDate: "2026-05-20",
    issuedBy: "Lic. Carlos García López",
    caseNumber: "EXP-2026-00145",
    pageNumbers: 3,
    name: "Notificación de Infracción de Tránsito",
    reference: "Exceso de velocidad en zona de 40 km/h en 9na avenida zona 12. Lo que constituye una infracción al artículo 130 del Reglamento de Tránsito.",
    file: mockUploadedFile,
};

// Componente wrapper con interactividad - Abre con botón
const ModalWithButton: React.FC<Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (data: casesNotificationFormData) => {
        alert(
            `✅ Formulario enviado exitosamente\n\n` +
            `Área destino: ${data.destinyArea}\n` +
            `Fecha: ${data.documentDate}\n` +
            `Emitido por: ${data.issuedBy}\n` +
            `Expediente: ${data.caseNumber}\n` +
            `Folios: ${data.pageNumbers}\n` +
            `Nombre: ${data.name}\n` +
            `Referencia: ${data.reference}\n` +
            `Archivo: ${data.file.name}`
        );
        setIsOpen(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <Button variant="contained" color="default" onClick={() => setIsOpen(true)}>
                Abrir Vista Previa
            </Button>
            <MOD10Modal
                {...(props as MOD10ModalProps)}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

// Componente wrapper con modal abierto automáticamente
const ModalAutoOpen: React.FC<Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">> = (props) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleSubmit = (data: casesNotificationFormData) => {
        alert(
            `✅ Formulario enviado exitosamente\n\n` +
            `Área destino: ${data.destinyArea}\n` +
            `Fecha: ${data.documentDate}\n` +
            `Emitido por: ${data.issuedBy}\n` +
            `Expediente: ${data.caseNumber}\n` +
            `Folios: ${data.pageNumbers}\n` +
            `Nombre: ${data.name}\n` +
            `Referencia: ${data.reference}\n` +
            `Archivo: ${data.file.name}`
        );
        setIsOpen(false);
    };

    return (
        <MOD10Modal
            {...(props as MOD10ModalProps)}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSubmit={handleSubmit}
        />
    );
};

type Story = StoryObj<Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">>;

export const Default: Story = {
    args: {} as Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">,
    render: () => <ModalWithButton {...baseData} />,
};

export const PMTArea: Story = {
    args: {} as Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">,
    render: () => (
        <ModalWithButton
            {...baseData}
            issuedBy="Ing. Roberto Mendez"
            name="Reportes de semaforización"
            reference="Semáforo defectuoso en intersección 9na avenida y 2a calle zona 12"
        />
    ),
};

export const Semaforización: Story = {
    args: {} as Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">,
    render: () => (
        <ModalWithButton
            {...baseData}
            destinyArea="gzamora@muniguate.com"
            issuedBy="Arq. Guillermo Zamora"
            caseNumber="EXP-2026-00146"
            pageNumbers={5}
            name="Mantenimiento de semaforización"
            reference="Revisión de sistema de control de tráfico en ruta hacia ciudad nueva"
        />
    ),
};

export const Juridico: Story = {
    args: {} as Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">,
    render: () => (
        <ModalWithButton
            {...baseData}
            destinyArea="jgis@muniguate.com"
            documentDate="2026-05-25"
            issuedBy="Lic. Javier Girón"
            caseNumber="EXP-2026-00147"
            pageNumbers={8}
            name="Dictamen Legal"
            reference="Requerimiento de asesoría legal respecto a procedimiento administrativo de tránsito"
        />
    ),
};

export const AutoOpened: Story = {
    args: {} as Omit<MOD10ModalProps, "isOpen" | "onClose" | "onSubmit">,
    render: () => <ModalAutoOpen {...baseData} />,
};
