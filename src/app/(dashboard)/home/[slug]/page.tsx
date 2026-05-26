import PROC01 from "@/pages/PROC01/PROC01";
import { notFound } from "next/navigation";

const APP_REGISTRY: Record<string, React.ComponentType> = {
    "proc01": PROC01,
    // "proc02": PROC02, // 👈 and here
};

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const AppComponent = APP_REGISTRY[slug];

    if (!AppComponent) return notFound();

    return <AppComponent />;
}