import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfigurationManagement } from "./";

const meta: Meta<typeof ConfigurationManagement> = {
    title: "Organisms/ConfigurationManagement",
    component: ConfigurationManagement,
    tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};