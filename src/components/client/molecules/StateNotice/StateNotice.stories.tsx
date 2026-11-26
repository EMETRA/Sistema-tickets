import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/client/atoms/Button";
import { StateNotice } from "./index";

const meta: Meta<typeof StateNotice> = {
    title: "Molecules/StateNotice",
    component: StateNotice,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Aviso de estado común. Siempre dice qué pasó y qué hacer; con `helpTopic` ofrece «Avisarle a Informática».",
            },
        },
    },
    args: {
        tone: "error",
        title: "No se pudieron consultar los permisos",
        description: "Intenta consultar de nuevo para continuar.",
        helpTopic: "comunicacion",
        actions: <Button>Reintentar</Button>,
    },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ConError: Story = {};
export const ConReferencia: Story = { args: { reference: "13783032-8507-41e1-8f59-5e91c0522eb6" } };
export const SinAcceso: Story = {
    args: {
        tone: "forbidden",
        title: "Sin acceso a este formulario",
        description: "Tu cuenta no tiene los permisos necesarios. Puedes solicitar acceso a Informática.",
        helpTopic: undefined,
        actions: <Button variant="outlined">Volver a aplicaciones</Button>,
    },
};
export const Vacio: Story = {
    args: { tone: "empty", title: "Aún no hay noticias", description: "Cuando publiques una, aparecerá aquí.", helpTopic: undefined, actions: undefined },
};
export const Exito: Story = {
    args: { tone: "success", title: "Noticia publicada", description: "Ya está visible para todo el personal.", helpTopic: undefined },
};
export const Compacto: Story = { args: { compact: true } };
