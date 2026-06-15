import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EnrollTable } from "./";

const meta: Meta<typeof EnrollTable> = {
    title: "Organisms/EnrollTable",
    component: EnrollTable,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        enroll: [
            {
                id: 1,
                name: 'Feyser Cáceres',
                department: 'Dirección de informática',
                employeeNumber: '2000145',
                permission: 'Administrador de tickets',
                status: 'Solicitado'
            },
            {
                id: 2,
                name: 'Gerbert Martinez',
                department: 'Dirección de Jurídico',
                employeeNumber: '2024043',
                permission: 'Permisos regulares tickets',
                status: 'Aprobado'
            }
        ]
    }
};