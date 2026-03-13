import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PermissionsForm } from "./";

const meta: Meta<typeof PermissionsForm> = {
    title: "Organisms/PermissionsForm",
    component: PermissionsForm,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};