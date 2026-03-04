import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NavItem } from "./index";

const meta: Meta<typeof NavItem> = {
    title: "Molecules/NavItem",
    component: NavItem,
    // El Decorator envuelve a todas las historias de este archivo
    decorators: [
        (Story) => (
            <div style={{ 
                backgroundColor: '#4361EE', 
                padding: '40px', 
                display: 'inline-flex', 
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                minWidth: '200px'
            }}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        backgrounds: { default: 'dark' } 
    }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        iconName: "home",
        label: "Inicio",
        active: false,
    },
};

export const Active: Story = {
    args: {
        iconName: "file",
        label: "Crear Ticket",
        active: true,
    },
};