import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchField } from "./";
import { useState } from "react";

const meta = {
    title: 'Molecules/SearchField',
    component: SearchField,
    tags: ['autodocs']
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        value: "",
        placeholder: "Buscar...",
        onChange: () => {},
        onSearch: () => {}
    },
    render: () => {
        const [value, setValue] = useState("");

        return (
            <SearchField
                value={value}
                onChange={setValue}
                onSearch={() => alert(value)}
                placeholder="Buscar..."
            />
        );
    }
};