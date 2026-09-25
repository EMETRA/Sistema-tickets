import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ButtonTab } from "./index";

const meta: Meta<typeof ButtonTab> = {
    title: "Atoms/ButtonTab",
    component: ButtonTab,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        value: "all",
        onChange: () => undefined,
        options: [
            { label: "Todos", value: "all", icon: "ticket-solid" },
            { label: "Asignados", value: "assigned", icon: "user-tag-solid" },
            { label: "General", value: "general" },
        ],
    },
};
