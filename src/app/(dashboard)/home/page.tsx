"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { usePlatform } from "@/platform/context";
import { HomeWorkspace } from "@/views/Platform/HomeWorkspace";
import AdminHome from "@/views/Home/Admin";
import TechHome from "@/views/Home/Tech";
import UserHome from "@/views/Home/User";

export default function HomePage() {
    const platform = usePlatform();
    const role = useAuthStore((state) => state.getRole());

    const views: Partial<Record<string, React.ReactNode>> = {
        ADMINISTRADOR: <AdminHome />,
        TECNICO: <TechHome />,
        DESARROLLADOR: <TechHome />,
        USUARIO: <UserHome />,
    };

    if (platform.data) return <HomeWorkspace />;
    if (platform.loading)
        return <p role="status">Cargando tu espacio de trabajo…</p>;
    if (platform.error) return <p role="alert">{platform.error}</p>;
    return views[role] ?? <UserHome />;
}
