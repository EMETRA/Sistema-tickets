
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MarkdownViewer } from "./MarkdownViewer";

const meta: Meta<typeof MarkdownViewer> = {
    title: "Molecules/MarkdownViewer",
    component: MarkdownViewer,
};

export default meta;

export const Default: StoryObj<typeof MarkdownViewer> = {
    args: {
        content: " swqswqsqw **Probando jejej *wedewd <u>wddwded </u>~~<u>dwedwe</u>~~***\n\n- ***~~<u>dwiwjwd</u>~~***\n- ***~~<u>wdwedwe</u>~~***\n- Hola\n- w\n- sw\n- swq\n- swq\n- s\n- qws\n- qws\n- qws\n\nqsqwsqwx",
    },
};