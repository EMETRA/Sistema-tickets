import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EquipmentReportPanel } from "./index";

const meta: Meta<typeof EquipmentReportPanel> = {
    title: "Organisms/EquipmentReportPanel",
    component: EquipmentReportPanel,
};

export default meta;

export const Default: StoryObj<typeof EquipmentReportPanel> = {
    args: {
        percentage: 85,
        items: [
            { 
                iconName: "desktop-solid", 
                title: "Monitor", 
                description: "Dell 27 pulgadas", 
                iconColor: "#6F87FB" 
            },
            { 
                iconName: "keyboard-solid", 
                title: "Teclado", 
                description: "Microsoft e56a5", 
                iconColor: "#99cc33" 
            },
            { 
                iconName: "computer-solid", 
                title: "CPU", 
                description: "Dell icore 5", 
                iconColor: "#FFB347" 
            },
            { 
                iconName: "print-solid", 
                title: "Impresora", 
                description: "No asignada", 
                iconColor: "#9C27B0" 
            },
            { 
                iconName: "computer-mouse-solid", 
                title: "Mouse", 
                description: "Logitech 205", 
                iconColor: "#D32F2F" 
            },
            { 
                iconName: "fax-solid", 
                title: "Fax", 
                description: "No asignada", 
                iconColor: "#2C3E50" 
            },
        ]
    }
};