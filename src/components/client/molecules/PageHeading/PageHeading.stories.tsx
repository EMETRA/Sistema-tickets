import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageHeading } from "./PageHeading";
const meta = {
    title: "Molecules/PageHeading",
    component: PageHeading,
    parameters: { layout: "padded" },
    args: {
        title: "Solicitudes registradas",
        description: "Consulta el estado y da seguimiento a tus solicitudes.",
    },
} satisfies Meta<typeof PageHeading>;
export default meta;
export const Predeterminado: StoryObj<typeof meta> = {};
