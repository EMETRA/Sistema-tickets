import MOD10 from "@/pages/MOD10";
import PROC01 from "@/pages/PROC01/PROC01";
import { notFound } from "next/navigation";

const APP_REGISTRY: Record<string, React.ComponentType> = {
    "proc01": PROC01,
    "mod10": MOD10,
};

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const AppComponent = APP_REGISTRY[slug];

    if (!AppComponent) return notFound();

    return <AppComponent />;
}