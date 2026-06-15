import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RolesTable } from "./";

const meta: Meta<typeof RolesTable> = {
    title: "Organisms/RolesTable",
    component: RolesTable,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        roles: [
            {
                id: 1,
                name: 'Administrador del sistema',
                code: '0001',
                roleCode: 'GRPADMIN',
                status: 'Activo'
            },
            {
                id: 2,
                name: 'Usuario regular',
                code: '0002',
                roleCode: 'GRPREGULAR',
                status: 'Baja'
            }
        ]
    }
}