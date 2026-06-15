import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardSwitch } from "./index";
import { useState } from "react";

const meta: Meta<typeof CardSwitch> = {
    title: "Molecules/CardSwitch",
    component: CardSwitch,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Creamos un Template base que maneje el estado para todas las historias
const CardSwitchWithState = (args: React.ComponentProps<typeof CardSwitch>) => {
    // Inicializamos con el valor que venga en los args o el primero de la lista
    const [selected, setSelected] = useState(args.value || args.options[0].value);
    
    return (
        <CardSwitch 
            {...args} 
            value={selected} 
            onChange={(val) => {
                setSelected(val);
                args.onChange(val);
            }} 
        />
    );
};

export const TwoOptions: Story = {
    render: (args) => <CardSwitchWithState {...args} />,
    args: {
        options: [
            { label: "Perfil", value: "perfil" },
            { label: "Mantenimiento", value: "mantenimiento" },
        ],
    },
};

export const MultipleOptions: Story = {
    render: (args) => <CardSwitchWithState {...args} />,
    args: {
        options: [
            { label: "Vista 1", value: "view1" },
            { label: "Vista 2", value: "view2" },
            { label: "Vista 3", value: "view3" },
            { label: "Vista 4", value: "view4" },
            { label: "Vista 5", value: "view5" },
        ],
    },
};