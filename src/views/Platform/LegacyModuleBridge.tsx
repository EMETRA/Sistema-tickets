"use client";
import { usePlatform } from "@/platform/context";
import { PlatformRoute } from "./PlatformRoute";
import DashboardProjects from "@/views/DashboardProjects";
import DashboardCollaborators from "@/views/DashboardCollaborators/DashboardCollaborators";
import MOD13 from "@/views/MOD13";
export function ProjectsBridge() {
    const { disabled } = usePlatform();
    return disabled ? (
        <DashboardProjects />
    ) : (
        <PlatformRoute section="metricas" />
    );
}
export function CollaboratorsBridge() {
    const { disabled } = usePlatform();
    return disabled ? (
        <DashboardCollaborators />
    ) : (
        <PlatformRoute section="metricas" />
    );
}
export function SearchBridge() {
    const { disabled } = usePlatform();
    return disabled ? <MOD13 /> : <PlatformRoute section="busqueda" />;
}
