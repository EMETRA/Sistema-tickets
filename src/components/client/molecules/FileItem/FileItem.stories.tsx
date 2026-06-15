import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileItem } from "./";

const meta = {
    title: "Molecules/FileItem",
    component: FileItem,
    tags: ["autodocs"]
} satisfies Meta<typeof FileItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uploaded: Story = {
    args: {
        name: "image.png",
        status: "done",
        onRemove: () => alert("remove")
    }
};

export const Uploading: Story = {
    args: {
        name: "image.png",
        status: "uploading",
        progress: 50,
        onRemove: () => alert("remove")
    }
};