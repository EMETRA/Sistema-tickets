import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MemberOption } from "./index";
import { useState } from "react";

const meta: Meta<typeof MemberOption> = {
    title: "Components/Client/Molecules/MemberOption",
    component: MemberOption,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div style={{ width: '300px', padding: '20px', backgroundColor: '#FFF', border: '1px solid #EEE', borderRadius: '8px' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const UserList: Story = {
    render: () => {
        const [selected, setSelected] = useState("Feyser Caceres");
        
        const users = [
            { name: "Feyser Caceres", initials: "F" },
            { name: "Melanie Bracamonte", initials: "M" },
            { name: "Gerardo Zamora", initials: "G" },
            { name: "Roger Herrera", initials: "R" },
            { name: "Miguel Hernández", initials: "M" },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ color: '#999', marginBottom: '12px', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>Seleccionar Usuario</h4>
                {users.map(user => (
                    <MemberOption 
                        key={user.name}
                        name={user.name}
                        initials={user.initials}
                        active={selected === user.name}
                        onClick={() => setSelected(user.name)}
                    />
                ))}
            </div>
        );
    }
};