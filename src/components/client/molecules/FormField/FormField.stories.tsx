import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormField } from "./";
import { Input } from "../../atoms/Input";


const meta = {
    title: "Molecules/FormField",
    component: FormField,
    tags: ["autodocs"]
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Email",
        htmlFor: "email",
        required: true,
        children: (
            <Input id="email" placeholder="email@ejemplo.com" />
        )
    }
};