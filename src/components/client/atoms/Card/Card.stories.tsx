import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./";
import { Button } from "../Button";

const meta = {
    title: "Atoms/Card",
    component: Card,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["default", "info", "centered", "kpi"],
            description: "Variante visual de la tarjeta",
        },
        title: {
            control: "text",
            description: "Título que se muestra en la tarjeta",
        },
        value: {
            control: "text",
            description: "Valor principal que se muestra en la tarjeta",
        },
        description: {
            control: "text",
            description: "Descripción adicional que se muestra debajo del título o valor",
        },
        actions: {
            control: false,
            description: "Acciones o botones que se muestran dentro de la tarjeta",
        },
    },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "Título de la tarjeta",
        value: "Valor principal",
        description: "Descripción adicional que se muestra debajo del título o valor",
    },
};

export const InfoCard: Story = {
    args: {
        title: "Título de la tarjeta",
        value: "Valor principal",
        variant: "info",
    },
};

export const Centered: Story = {
    args: {
        title: "Título de la tarjeta",
        value: "Valor principal",
        description: "Descripción adicional que se muestra debajo del título o valor",
        variant: "centered",
    },
};

export const KPI: Story = {
    args: {
        title: "Título de la tarjeta",
        value: "Valor principal",
        variant: "kpi",
    },
};

export const WithActions: Story = {
    args: {
        title: "Título de la tarjeta",
        value: "Valor principal",
        description: "Descripción adicional que se muestra debajo del título o valor",
        variant: "centered",
        actions: (
            <>
                <Button variant="contained" color="success" onClick={() => alert("Acción 1")}>
                    Acción
                </Button>
                <Button variant="outlined" color="danger" onClick={() => alert("Acción 2")}>
                    Acción 2
                </Button>
            </>
        ),
    },
};