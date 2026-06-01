import DashboardCollaborators from "@/pages/DashboardCollaborators/DashboardCollaborators";
import DashboardProjects from "@/pages/DashboardProjects";
import ExportMOD01 from "@/pages/ExportMOD01";
import MOD01 from "@/pages/MOD01";
import MOD04 from "@/pages/MOD04";
import MOD05 from "@/pages/MOD05";
import MOD06 from "@/pages/MOD06";
import MOD08 from "@/pages/MOD08";
import MOD10 from "@/pages/MOD10";
import PROC01 from "@/pages/PROC01/PROC01";
import SaveMOD01 from "@/pages/SaveMOD01/ExportMOD01";
import { notFound } from "next/navigation";

const APP_REGISTRY: Record<string, React.ComponentType> = {
    "proc01": PROC01,
    "mod08": MOD08,
    "mod10": MOD10,
    "mod01": MOD01,
    "mod04": MOD04,
    "mod05": MOD05,
    "mod06": MOD06,
    "dashboard-proyectos": DashboardProjects, 
    "dashboard-colaboradores": DashboardCollaborators,
    "exportmod01": ExportMOD01,
    "save-mod01": SaveMOD01,
};

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const AppComponent = APP_REGISTRY[slug];

    if (!AppComponent) return notFound();

    return <AppComponent />;
}