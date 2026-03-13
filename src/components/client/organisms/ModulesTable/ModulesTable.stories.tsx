import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ModulesTable } from "./";

const meta: Meta<typeof ModulesTable> = {
    title: "Organisms/ModulesTable",
    component: ModulesTable,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        modules: [
            {
                id: 1,
                name: 'Evial',
                status: 'Activo'
            },
            {
                id: 2,
                name: 'Tickets',
                status: 'Baja'
            }
        ]
    }
};