import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Image } from "./index";

const meta: Meta<typeof Image> = { title: "Components/Client/Atoms/Image", component: Image, tags: ["autodocs"] };
export default meta;
export const Default: StoryObj<typeof Image> = { 
    args: { 
        src: "/images/image.png",
        alt: "Logo Emetra o Imagen de prueba", 
        width: 150, 
        height: 150, 
        rounded: false 
    } 
};