"use client";
import { usePlatform } from "@/platform/context";
import { PlatformRoute } from "./PlatformRoute";
import DashboardProjects from "@/views/DashboardProjects";
import DashboardCollaborators from "@/views/DashboardCollaborators/DashboardCollaborators";
import MOD13 from "@/views/MOD13";
import MOD06 from "@/views/MOD06";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function PermissionsBridge() {
    const { disabled, loading } = usePlatform();
    const router = useRouter();
    useEffect(() => { if (!loading && !disabled) router.replace("/espacio/accesos?tab=corporate"); }, [loading, disabled, router]);
    return disabled ? <MOD06 /> : <p role="status">Abriendo Personas y accesos…</p>;
}
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
