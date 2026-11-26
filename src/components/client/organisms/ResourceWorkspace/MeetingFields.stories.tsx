import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { PlatformRecord } from "@/platform/types";
import { MeetingPlaceField } from "./MeetingFields";
import { MeetingCard } from "./MeetingCard";

const meta: Meta = {
    title: "Organisms/Calendario/Reunión virtual",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Modalidad de una actividad (presencial o virtual) y acceso «Unirse a la reunión». El enlace se guarda en el campo «lugar».",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

function Field({ initial }: { initial: string }) {
    const [value, setValue] = useState(initial);
    return (
        <div style={{ maxWidth: 620, display: "grid", gap: 12 }}>
            <MeetingPlaceField value={value} onChange={setValue} />
            <code style={{ fontSize: 12 }}>lugar = {JSON.stringify(value)}</code>
        </div>
    );
}

export const Presencial: Story = { render: () => <Field initial="Sala de Informática" /> };
export const Virtual: Story = { render: () => <Field initial="https://teams.microsoft.com/l/meetup-join/ejemplo" /> };
export const Mixta: Story = { render: () => <Field initial="Sala de juntas · https://meet.google.com/abc-defg-hij" /> };

const activity = (lugar: string, fin: string) =>
    ({ id: "1", nombre: "Reunión con Financiero", datos: { lugar, fin } }) as unknown as PlatformRecord;

export const TarjetaUnirse: Story = {
    render: () => <MeetingCard activity={activity("Sala de juntas · https://meet.google.com/abc-defg-hij", "2099-01-01T00:00:00Z")} />,
};
export const TarjetaTerminada: Story = {
    render: () => <MeetingCard activity={activity("https://zoom.us/j/123", "2020-01-01T00:00:00Z")} />,
};
