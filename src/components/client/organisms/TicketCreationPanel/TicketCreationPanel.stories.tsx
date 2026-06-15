import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketCreationPanel } from "./TicketCreationPanel";
import { SelectOption } from "../../atoms/Select/types";
import type { TicketFormData } from "./types";
import { useState } from "react";

const meta: Meta<typeof TicketCreationPanel> = {
    title: "Organisms/TicketCreationPanel",
    component: TicketCreationPanel,
    parameters: {
        layout: "padded",
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Departamentos de ejemplo
const sampleDepartments: SelectOption[] = [
    { value: "1", label: "Recursos Humanos" },
    { value: "2", label: "Informática" },
    { value: "3", label: "Jurídico" },
    { value: "4", label: "Contabilidad" },
    { value: "5", label: "Administración" },
    { value: "6", label: "Ventas" },
];

/**
 * Vista básica del formulario
 */
export const Default: Story = {
    args: {
        departments: sampleDepartments,
        onSubmit: (data) => console.log("Formulario enviado:", data),
        onCancel: () => console.log("Cancelado"),
    },
};

/**
 * Con valores iniciales
 */
export const WithInitialValues: Story = {
    args: {
        departments: sampleDepartments,
        onSubmit: (data) => console.log("Formulario enviado:", data),
        onCancel: () => console.log("Cancelado"),
        initialValues: {
            subject: "Problema con la computadora",
            departmentId: "2",
            description: "La computadora no enciende correctamente",
            files: [],
        },
    },
};

/**
 * En estado de carga
 */
export const Loading: Story = {
    args: {
        departments: sampleDepartments,
        onSubmit: (data) => console.log("Formulario enviado:", data),
        onCancel: () => console.log("Cancelado"),
        loading: true,
    },
};

/**
 * Vista interactiva completa
 */
export const Interactive: Story = {
    render: () => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleSubmit = (data: TicketFormData) => {
            console.log("Datos del formulario:", data);
            setIsSubmitting(true);

            // Simular envío al servidor
            setTimeout(() => {
                setIsSubmitting(false);
                alert("Ticket creado exitosamente!");
            }, 2000);
        };

        const handleCancel = () => {
            console.log("Formulario cancelado");
            if (confirm("¿Estás seguro de cancelar? Se perderán los cambios.")) {
                // Aquí podrías hacer algo como limpiar el formulario o redirigir
                alert("Formulario cancelado");
            }
        };

        return (
            <TicketCreationPanel
                departments={sampleDepartments}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={isSubmitting}
            />
        );
    },
};

/**
 * Solo con departamentos limitados
 */
export const LimitedDepartments: Story = {
    args: {
        departments: [
            { value: "2", label: "Informática" },
            { value: "3", label: "Jurídico" },
        ],
        onSubmit: (data) => console.log("Formulario enviado:", data),
        onCancel: () => console.log("Cancelado"),
    },
};
