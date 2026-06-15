
import { DropdownMenuItem } from "@/components/client/molecules/DropdownMenu";

const SYSTEMS_DATA: DropdownMenuItem[] = [
    { label: "Sistema Tickets", value: "option1" },
    { label: "Sistema de Gestión", value: "option2" },
    { label: "Sistema de Facturación", value: "option3" },
]

export async function getSystemsDummy(): Promise<DropdownMenuItem[]> {
    return SYSTEMS_DATA;
}
