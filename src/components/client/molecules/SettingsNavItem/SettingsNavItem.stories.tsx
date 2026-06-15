import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SettingsNavItem } from "./index";
import { useState } from "react";

const meta: Meta<typeof SettingsNavItem> = {
    title: "Molecules/SettingsNavItem",
    component: SettingsNavItem,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div style={{ 
                width: '350px', 
                padding: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EEEEEE',
                borderRadius: '8px'
            }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Menú Interactivo:
 * Esta historia maneja un estado local para permitirte
 * alternar la selección entre los diferentes ítems.
 */
export const InteractiveMenu: Story = {
    render: () => {
        // Estado para controlar cuál es el ítem activo actualmente
        const [activeLabel, setActiveLabel] = useState("Permisos del sistema");

        const menuItems: Array<{ icon: string; label: string }> = [
            { icon: "user-clock-solid", label: "Aprobar solicitudes" },
            { icon: "layer-group-solid", label: "Modulos del sistema" },
            { icon: "user-lock-solid", label: "Permisos del sistema" },
            { icon: "user-group-solid", label: "Roles del sistema" },
            { icon: "id-badge-solid", label: "Asignar Permisos" },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => (
                    <SettingsNavItem
                        key={item.label}
                        iconName={item.icon}
                        label={item.label}
                        active={activeLabel === item.label}
                        onClick={() => setActiveLabel(item.label)}
                    />
                ))}
            </div>
        );
    }
};