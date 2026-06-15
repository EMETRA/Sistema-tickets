import { Meta, StoryObj } from "@storybook/nextjs-vite";
import {SelectField} from "./";
import { Select } from "../../atoms/Select";

const meta = {
    title: "Molecules/SelectField",
    component: SelectField,
    tags: ["autodocs"]
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Role",
        htmlFor: "role",
        required: true,
        children: (
            <Select options={[]}/>
        )
    }
}