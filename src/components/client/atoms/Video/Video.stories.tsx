import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Video } from "./index";

const meta: Meta<typeof Video> = { title: "Atoms/Video", component: Video, tags: ["autodocs"] };
export default meta;
export const Default: StoryObj<typeof Video> = {
    args: {
        src: "https://www.youtube.com/watch?v=8NEc_kl8ThA",
        rounded: false,
    },
};
