import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chat } from "./index";

const meta: Meta<typeof Chat> = {
    title: "Organisms/Chat",
    component: Chat,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        ticketId: "12345",
    },
};

export const InteractiveExample = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px", padding: "20px", width: "80%", height: "300px",  }}>
            <Chat ticketId="12345" />
        </div>
    )
}