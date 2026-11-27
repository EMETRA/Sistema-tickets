import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PeoplePicker, type PeopleSearch } from "./index";

const PEOPLE = [
    { id: 1, nombre: "Ana Lucía Morales" },
    { id: 2, nombre: "Carlos Estrada" },
    { id: 3, nombre: "Rosa María Pérez" },
    { id: 4, nombre: "Julio Ajú" },
    { id: 5, nombre: "Marta Chávez" },
];
const search: PeopleSearch = async (q) =>
    PEOPLE.filter((p) => p.nombre.toLowerCase().includes(q.toLowerCase()));

const meta: Meta<typeof PeoplePicker> = {
    title: "Molecules/PeoplePicker",
    component: PeoplePicker,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Selector de participantes: escribir, tocar para agregar y × para quitar. Sustituye la lista múltiple con Ctrl/Cmd. La búsqueda se inyecta con `search`.",
            },
        },
    },
};
export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial = [] as number[], disabled = false }) {
    const [value, setValue] = useState<number[]>(initial);
    return (
        <div style={{ maxWidth: 520 }}>
            <PeoplePicker
                label="Participantes"
                value={value}
                onChange={setValue}
                search={search}
                disabled={disabled}
            />
        </div>
    );
}

export const Vacio: Story = { render: () => <Controlled /> };
export const ConParticipantes: Story = { render: () => <Controlled initial={[1, 3]} /> };
export const Deshabilitado: Story = { render: () => <Controlled initial={[2]} disabled /> };
