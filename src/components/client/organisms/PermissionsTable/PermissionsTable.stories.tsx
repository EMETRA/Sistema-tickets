import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PermissionsTable } from "./";

const meta: Meta<typeof PermissionsTable> = {
    title: "Organisms/PermissionsTable",
    component: PermissionsTable,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        permissions: [
            {
                id: 1,
                name: 'Permiso 1',
                status: 'Activo'
            },
            {
                id: 2,
                name: 'Permiso 2',
                status: 'Baja'
            }
        ]
    }
};