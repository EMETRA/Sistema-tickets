import { notFound } from "next/navigation";
import { TicketView } from "@/views/Tickets/TicketView";

export default async function TicketPage({
    params,
    searchParams,
}: {
    params: Promise<{ ticketId: string }>;
    searchParams: Promise<{ origen?: string }>;
}) {
    const { ticketId } = await params;
    const { origen } = await searchParams;
    if (!/^[1-9]\d*$/.test(ticketId) || !Number.isSafeInteger(Number(ticketId)))
        notFound();
    return (
        <TicketView
            ticketId={ticketId}
            returnHref={origen === "tickets" ? "/tickets" : "/mis-tickets"}
        />
    );
}
