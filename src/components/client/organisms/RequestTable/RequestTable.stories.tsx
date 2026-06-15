import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RequestTable } from "./";

const meta: Meta<typeof RequestTable> = {
    title: "Organisms/RequestTable",
    component: RequestTable,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        requests: [
            {
                id: 1,
                name: 'Feyser Cáceres',
                email: 'fcaceres@muniguate.com',
                employeeNumber: '2000145',
                budget: '011',
                position: 'Administrador de sistemas',
                status: 'Solicitado'
            },
            {
                id: 2,
                name: 'Gerbert Martinez',
                email: 'gmartinez@muniguate.com',
                employeeNumber: '2024043',
                budget: '011',
                position: 'Admin',
                status: 'Aprobado'
            }
        ]
    }
};