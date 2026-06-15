import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MessageText } from "./index";

const meta: Meta<typeof MessageText> = {
    title: "Molecules/MessageText",
    component: MessageText,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        userName: "John Doe",
        text: "Hello, this is a message!",
        timestamp: "2026-04-14T12:00:00Z",
        avatarProps: {
            initials: "JD",
        },
        files: [
            {
                id: "1",
                name: "document.pdf",
                onClick: (fileId: string) => alert("File clickaaed: " + fileId),
            },
            {
                id: "2",
                name: "image.png",
                onClick: (fileId: string) => alert("File clicked: " + fileId),
            },
        ],
    },
};

export const NoFiles: Story = {
    args: {
        userName: "Jane Smith",
        text: "This message has no files attached.",
        timestamp: "2026-04-13T15:30:00Z",
        avatarProps: {
            initials: "JS",
        },
    },
};

export const LongText: Story = {
    args: {
        userName: "Alice Johnson",
        text: "This is a very long message to test how the component handles overflow and text wrapping. It should properly display all the content without breaking the layout or causing any issues with the design.",
        timestamp: "2026-04-12T10:45:00Z",
        avatarProps: {
            initials: "AJ",
        },
    },
};
