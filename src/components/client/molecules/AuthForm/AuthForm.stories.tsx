import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthForm } from "./";
import { FormField } from "../FormField";
import { Input } from "../../atoms/Input";
import { FormActions } from "../FormActions";
import { Button } from "../../atoms/Button";

const meta = {
    title: "Molecules/AuthForm",
    component: AuthForm,
    tags: ["autodocs"]
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginExample: Story = {
    args: {
        title: "Login",
        children: (
            <>
                <FormField label="Email" htmlFor="email">
                    <Input id="email" />
                </FormField>

                <FormField label="Password" htmlFor="password">
                    <Input id="password" />
                </FormField>

                <FormActions>
                    <Button fullWidth color="success">
                        Enter
                    </Button>
                </FormActions>
            </>
        )
    }
};