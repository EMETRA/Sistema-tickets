import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PermissionToggle } from "./index";
import { useState } from "react";

const meta: Meta<typeof PermissionToggle> = {
    title: "Molecules/PermissionToggle",
    component: PermissionToggle,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: () => {
        const [isEnabled, setIsEnabled] = useState(false);
        return (
            <PermissionToggle 
                label="Grabar"
                checked={isEnabled}
                onChange={setIsEnabled}
            />
        );
    }
};

/**
 * Ejemplo de uso en grupo para paneles de configuración
 */
export const PermissionGrid: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '24px', padding: '20px', backgroundColor: '#FFF' }}>
            <PermissionToggle label="Grabar" checked={true} />
            <PermissionToggle label="Editar" checked={false} />
            <PermissionToggle label="Eliminar" checked={false} />
        </div>
    )
};