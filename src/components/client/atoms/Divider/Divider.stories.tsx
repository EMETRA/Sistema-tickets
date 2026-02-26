import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Divider } from "./index";

const meta: Meta<typeof Divider> = {
    title: "Components/Client/Atoms/Divider",
    component: Divider,
    tags: ["autodocs"],
    argTypes: {
        orientation: {
        control: { type: "radio" },
        options: ["horizontal", "vertical"],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    args: {
        orientation: "horizontal",
    },
    render: (args) => (
        <div style={{ width: "400px" }}>
        <p style={{ fontFamily: 'Montserrat' }}>Texto Superior</p>
        <Divider {...args} />
        <p style={{ fontFamily: 'Montserrat' }}>Texto Inferior</p>
        </div>
    ),
};

export const Vertical: Story = {
    args: {
        orientation: "vertical",
    },
    render: (args) => (
        <div style={{ 
        display: "flex", 
        alignItems: "center", 
        height: "50px", 
        fontFamily: 'Montserrat' 
        }}>
        <span style={{ fontFamily: 'Montserrat' }} >Sección A</span>
        <Divider {...args} />
        <span style={{ fontFamily: 'Montserrat' }} >Sección B</span>
        </div>
    ),
};