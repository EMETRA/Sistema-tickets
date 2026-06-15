import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RichTextToolbar } from "./";

const meta = {
    title: "Molecules/RichTextToolbar",
    component: RichTextToolbar,
    tags: ["autodocs"]
} satisfies Meta<typeof RichTextToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onAction: (a) => alert(a)
    }
};