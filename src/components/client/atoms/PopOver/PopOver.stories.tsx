import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PopOver } from "./index";

const meta: Meta<typeof PopOver> = {
    title: "Components/Client/Atoms/PopOver",
    component: PopOver,
    argTypes: {
        position: {
        control: { type: 'select' },
        options: [
            "center", "top", "bottom", "left", "right", 
            "top-left", "top-right", "bottom-left", "bottom-right"
        ],
        },
    },
};

export default meta;

export const DynamicPosition: StoryObj<typeof PopOver> = {
    args: {
        isOpen: true,
        position: "center",
        children: (
        <div style={{ fontFamily: 'Gadugi' }}>
            <h3 style={{ marginTop: '15px', marginBottom: '-6px', fontWeight: 700 }}>Asignar Usuario</h3>
            <p style={{ fontSize: '14px' }}>Contenido flexible dentro del esqueleto.</p>
        </div>
        ),
    },
};