import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserMenu } from "./index";

const meta: Meta<typeof UserMenu> = {
    title: "Molecules/UserMenu",
    component: UserMenu,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {
    args: {
        name: "Gildder Caceres",
        role: "Administrador",
        status: "online",
    },
};

export const UserWithImage: Story = {
    args: {
        name: "Gildder Caceres",
        role: "Administrador",
        status: "online",
        avatarUrl: "/images/image.png",
    },
};

export const RingedFalse: Story = {
    args: {
        name: "Gildder Caceres",
        role: "Administrador",
    },
};
