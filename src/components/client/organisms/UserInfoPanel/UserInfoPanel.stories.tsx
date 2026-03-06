import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserInfoPanel } from "./index";

const meta: Meta<typeof UserInfoPanel> = {
    title: "Organisms/UserInfoPanel",
    component: UserInfoPanel,
};

export default meta;

export const Default: StoryObj<typeof UserInfoPanel> = {
    args: {
        locations: ["Zona 3", "Zona 7", "Zona 5", "Zona 1"],
        vacationDays: 15
    }
};