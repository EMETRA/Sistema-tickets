import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormActions } from "./";
import { Button } from "../../atoms/Button";

const meta = {
    title: "Molecules/FormActions",
    component: FormActions,
    tags: ["autodocs"]
} satisfies Meta<typeof FormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <>
                <Button variant="text">Cancel</Button>
                <Button color="success">Save</Button>
            </>
        )
    }
};

export const Left: Story = {
    args: {
        align: 'left',
        children: (
            <>
                <Button variant="text">Cancel</Button>
                <Button color="success">Save</Button>
            </>
        )
    }
};

export const Center: Story = {
    args: {
        align: 'center',
        children: (
            <>
                <Button variant="text">Cancel</Button>
                <Button color="success">Save</Button>
            </>
        )
    }
};