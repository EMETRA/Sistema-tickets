import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EquipmentItem from "./index";

const meta: Meta<typeof EquipmentItem> = {
    title: "Molecules/EquipmentItem",
    component: EquipmentItem,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        iconName: "desktop-solid",
        title: "Monitor",
        description: "Dell 27 pulgadas",
        iconColor: "#6F87FB"
    },
};

export const EquipmentGrid: Story = {
    render: () => (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px', 
            maxWidth: '400px',
            // padding: '10px'
        }}>
            <EquipmentItem iconName="desktop-solid" title="Monitor" description="Dell 27 pulgadas" iconColor="#6F87FB" />
            <EquipmentItem iconName="keyboard-solid" title="Teclado" description="Microsoft e56a5" iconColor="#99cc33" />
            <EquipmentItem iconName="computer-solid" title="CPU" description="Dell icore 5" iconColor="#FFB347" />
            <EquipmentItem iconName="print-solid" title="Impresora" description="No asignada" iconColor="#9C27B0" />
            <EquipmentItem iconName="computer-mouse-solid" title="Mouse" description="Logitech 205" iconColor="#D32F2F" />
            <EquipmentItem iconName="fax-solid" title="Fax" description="No asignada" iconColor="#2C3E50" />
        </div>
    )
};