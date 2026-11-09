"use client";
import { useRouter } from "next/navigation";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
export function TicketView({
    ticketId,
    returnHref,
}: {
    ticketId: string;
    returnHref: string;
}) {
    const router = useRouter();
    return (
        <TicketDetail
            key={ticketId}
            ticketId={ticketId}
            isOpen
            presentation="page"
            returnHref={returnHref}
            onClose={() => router.push(returnHref)}
        />
    );
}
