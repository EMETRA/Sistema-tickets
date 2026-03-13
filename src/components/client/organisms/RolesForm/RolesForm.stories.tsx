import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RolesForm } from "./";

const meta: Meta<typeof RolesForm> = {
    title: "Organisms/RolesForm",
    component: RolesForm,
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
                description: 'Descripcion del permiso si es demasiado largo debera ser cortada',
                grabar: true,
                editar: false,
                eliminar: true,
                ver: true
            },
            {
                id: 2,
                name: 'Permiso 2',
                description: 'Descripcion del permiso si es demasiado largo debera ser cortada',
                grabar: false,
                editar: true,
                eliminar: false,
                ver: true
            }
        ]
    }
};