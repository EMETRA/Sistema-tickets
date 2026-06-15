import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ModulesForm } from "./";

const meta: Meta<typeof ModulesForm> = {
    title: 'Organisms/ModulesForm',
    component: ModulesForm,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};