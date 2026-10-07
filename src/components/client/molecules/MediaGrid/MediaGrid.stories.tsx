import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MediaGrid } from "./index";

const meta: Meta<typeof MediaGrid> = {
    title: "Molecules/MediaGrid",
    component: MediaGrid,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        columns: 3,
        items: [
            {
                type: "image",
                src: "/images/image.png",
                alt: "Imagen de prueba",
                width: 150,
                height: 150,
            },
            {
                type: "video",
                src: "/videos/sample.mp4",
            },
            {
                type: "file",
                id: "file-1",
                name: "document.pdf",
                onClick: () => undefined,
            },
        ],
    },
};

export const ManyFiles: Story = {
    args: {
        columns: 3,
        items: [
            {
                type: "image",
                src: "/images/image.png",
                alt: "Imagen de prueba",
                width: 150,
                height: 150,
            },
            {
                type: "video",
                src: "/videos/sample.mp4",
            },
            {
                type: "image",
                src: "/images/no-user.png",
                alt: "Imagen de prueba",
                width: 150,
                height: 150,
            },
            {
                type: "file",
                id: "file-1",
                name: "document.pdf",
                onClick: () => undefined,
            },
            {
                type: "file",
                id: "file-1",
                name: "document.pdf",
                onClick: () => undefined,
            },
            {
                type: "file",
                id: "file-1",
                name: "document.docx",
                onClick: () => undefined,
            },
        ],
    },
};
