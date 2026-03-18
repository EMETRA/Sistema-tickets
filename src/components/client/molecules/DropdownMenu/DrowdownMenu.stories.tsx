import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DropdownMenu } from "./DropdownMenu";

const meta = {
    title: "Molecules/DropdownMenu",
    component: DropdownMenu,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        items: {
            control: "object",
            description: "Lista de opciones del menú desplegable",
        },
        onSelect: {
            action: "selected",
            description: "Función que se ejecuta al seleccionar una opción",
        },
    },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        items: [
            { label: "Sistema Tickets", value: "option1" },
            { label: "Sistema de Gestión", value: "option2" },
            { label: "Sistema de Facturación", value: "option3" },
        ],
        onSelect: () => {},
    },

    render: (args) => {
        const [selectedItem, setSelectedItem] = useState(args.items[0]);
        const handleSelect = (item: any) => {
            setSelectedItem(item);
            args.onSelect(item);
        };

        return (
            <>
                <DropdownMenu {...args} items={args.items} onSelect={handleSelect} />
                <p>Elemento seleccionado: {selectedItem.value}</p>
            </>
        );
    }
};