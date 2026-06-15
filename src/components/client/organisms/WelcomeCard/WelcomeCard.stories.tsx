import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WelcomeCard from "./WelcomeCard";

const meta: Meta<typeof WelcomeCard> = {
    title: "Organisms/WelcomeCard",
    component: WelcomeCard,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        userName: "Gildder",
        imageSrc: "/images/image.png"
    },
};