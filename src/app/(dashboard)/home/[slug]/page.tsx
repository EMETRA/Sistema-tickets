import DashboardCollaborators from "@/views/DashboardCollaborators/DashboardCollaborators";
import DashboardProjects from "@/views/DashboardProjects";
import ExportMOD01 from "@/views/ExportMOD01";
import MOD01 from "@/views/MOD01";
import MOD04 from "@/views/MOD04";
import MOD05 from "@/views/MOD05";
import MOD06 from "@/views/MOD06";
import MOD07 from "@/views/MOD07";
import MOD08 from "@/views/MOD08";
import MOD10 from "@/views/MOD10";
import PROC01 from "@/views/PROC01/PROC01";
import SaveMOD01 from "@/views/SaveMOD01/ExportMOD01";
import { notFound } from "next/navigation";

const APP_REGISTRY: Record<string, React.ComponentType> = {
    "proc01": PROC01,
    "mod08": MOD08,
    "mod10": MOD10,
    "mod01": MOD01,
    "mod04": MOD04,
    "mod05": MOD05,
    "mod06": MOD06,
    "mod07": MOD07,
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