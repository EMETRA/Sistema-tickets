import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { File } from "./index";

const meta: Meta<typeof File> = {
    title: "Atoms/File",
    component: File,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        name: "document.pdf",
        onClick: () => alert("File clicked!"),
    },
};

export const Outlined: Story = {
    args: {
        name: "document.pdf",
        onClick: () => alert("File clicked!"),
        variant: "outlined",
    },
};
