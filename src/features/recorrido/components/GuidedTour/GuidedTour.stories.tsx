import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { TourStep } from "@/config/guided-tour";
import { GuidedTour } from "./GuidedTour";

const meta: Meta<typeof GuidedTour> = {
    title: "Organisms/GuidedTour",
    component: GuidedTour,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Recorrido guiado. Los pasos vienen de `config/guided-tour.ts` y señalan elementos con `data-tour`. Teclado: ← → para moverse, Esc para salir.",
            },
        },
    },
};
export default meta;
type Story = StoryObj<typeof meta>;

const STEPS: TourStep[] = [
    { id: "hola", title: "Te damos la bienvenida", body: "Un paso centrado, sin elemento señalado." },
    {
        id: "menu",
        target: '[data-tour="demo-menu"]',
        title: "Tu menú",
        body: "El recorrido resalta el elemento y coloca la tarjeta a su lado.",
    },
    {
        id: "boton",
        target: '[data-tour="demo-boton"]',
        title: "Crear ticket",
        body: "Si no cabe a la derecha, la tarjeta se coloca debajo o arriba.",
    },
    {
        id: "falta",
        target: '[data-tour="no-existe"]',
        title: "Paso omitido",
        body: "Este elemento no existe, así que no se muestra.",
    },
    { id: "fin", title: "¡Listo!", body: "Terminar guarda que ya se vio el recorrido." },
];

function Demo() {
    const [open, setOpen] = useState(true);
    const [result, setResult] = useState("");
    return (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: 520 }}>
            <nav
                data-tour="demo-menu"
                style={{
                    padding: 16,
                    borderRight: "1px solid var(--tickets-border)",
                    display: "grid",
                    gap: 8,
                    alignContent: "start",
                }}
            >
                <a>Inicio</a>
                <a>Mis solicitudes</a>
                <a>Calendario</a>
            </nav>
            <main style={{ padding: 24 }}>
                <button data-tour="demo-boton" type="button" onClick={() => setOpen(true)}>
                    Ver recorrido de nuevo
                </button>
                {result && <p>Resultado: {result}</p>}
            </main>
            <GuidedTour
                steps={STEPS}
                open={open}
                onClose={(done) => {
                    setOpen(false);
                    setResult(done ? "completado" : "omitido");
                }}
            />
        </div>
    );
}

export const Recorrido: Story = { render: () => <Demo /> };
