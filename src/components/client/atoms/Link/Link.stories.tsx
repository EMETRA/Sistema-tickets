import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Components/Client/Atoms/Link", // Nota que este es Client
  component: Link,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginLink: Story = { 
    args: { 
        children: "¿Olvidaste tu contraseña?", 
        href: "/forgot-password" 
    } 
};

export const RegisterLink: Story = { 
    args: { 
        children: "Regístrate", 
        href: "/register" 
    } 
};