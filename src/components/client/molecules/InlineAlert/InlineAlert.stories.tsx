import type { Meta } from "@storybook/nextjs-vite";
import { InlineAlert } from "./index";
import { useState } from "react";
import { Button } from "../../atoms/Button";

const meta: Meta<typeof InlineAlert> = {
    title: "Molecules/InlineAlert",
    component: InlineAlert,
};

export default meta;

export const RevertAlert = () => {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ height: '300px', padding: '20px' }}>
            <Button onClick={() => setOpen(true)}>Simular cancelación de ticket</Button>
            
            <InlineAlert 
                isOpen={open}
                onClose={() => setOpen(false)}
                onAction={() => {
                    alert("Acción revertida con éxito");
                    setOpen(false);
                }}
                title="Revertir cancelación"
                description="Cierra la alerta si no quieres revertirlo o espera a que se cierre"
                actionLabel="Revertir"
                duration={7}
            />
        </div>
    );
};