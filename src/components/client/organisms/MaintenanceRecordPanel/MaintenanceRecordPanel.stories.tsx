import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MaintenanceRecordPanel } from "./MaintenanceRecordPanel";

const meta: Meta<typeof MaintenanceRecordPanel> = {
    title: "Organisms/MaintenanceRecordPanel",
    component: MaintenanceRecordPanel,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        lastMaintenance: "28/11/2023",
        nextMaintenance: "28/11/2023",
        observations: "Ejemplo de una descripcion, limpieza de cpu, cambio de baterias."
    },
};