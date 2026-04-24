import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketDetail } from "./index";

import { useState } from "react";
import { Button } from "../../atoms/Button";

const meta: Meta<typeof TicketDetail> = {
    title: "Organisms/TicketDetail",
    component: TicketDetail,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveExample = () => {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px", padding: "20px" }}>
            <Button onClick={() => setOpen(true)}>Abrir ticket details</Button>

            <TicketDetail
                ticketId="123"
                isOpen={open}
                onClose={() => setOpen(false)}
            />
        </div>
    );
};