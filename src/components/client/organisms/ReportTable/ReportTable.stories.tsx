import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ReportTable from "./ReportTable";

const meta: Meta<typeof ReportTable> = {
    title: "Organisms/ReportTable",
    component: ReportTable,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Anual: Story = {
    args: {
        title: "Reporte durante el año",
        iconName: "chart-simple-solid",
        data: [
            { label: "Enero", value: 1800 },
            { label: "Febrero", value: 1800 },
            { label: "Marzo", value: 1750 },
            { label: "Abril", value: 1300 },
            { label: "Mayo", value: 1100 },
            { label: "Junio", value: 1100 },
            { label: "Julio", value: 950 },
            { label: "Agosto", value: 700 },
            { label: "Septiembre", value: 650 },
            { label: "Octubre", value: 600 },
            { label: "Noviembre",value: 550 },
            { label: "Diciembre", value: 500 },
        ]
    },
};