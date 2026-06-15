import type { Meta } from "@storybook/nextjs-vite";
import { ModalContent } from "./index";
import { useState } from "react";
import { Button } from "../../atoms/Button";

const meta: Meta<typeof ModalContent> = {
    title: "Molecules/ModalContent",
    component: ModalContent,
};

export default meta;

export const InteractiveExample = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Abrir modal</Button>
            
            <ModalContent 
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={() => {
                    alert("Ticket Cancelado");
                    setOpen(false);
                }}
                title="Cancelar"
                description="Estas seguro de cancelar este ticket, este ticket lo encontraras en el apartado de cancelados"
                confirmLabel="Confirmar"
                cancelLabel="Cancelar"
            />
        </>
    );
};