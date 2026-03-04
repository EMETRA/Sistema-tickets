import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RichTextField } from "./";
import { useState } from "react";

const meta = {
    title: "Molecules/RichTextField",
    component: RichTextField,
    tags: ["autodocs"]
} satisfies Meta<typeof RichTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        value: "",
        onChange: () => {}
    },
    render: () => {
        const [value, setValue] = useState("");
        
        return (
            <RichTextField 
                value={value}
                onChange={setValue}
            />
        )
    }
}