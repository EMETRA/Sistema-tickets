import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileDropzone } from "./";

const meta = {
    title: "Molecules/FileDropzone",
    component: FileDropzone,
    tags: ["autodocs"]
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onFiles: (files) => alert(files.length)
    }
}