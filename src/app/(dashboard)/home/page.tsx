"use client";

import { useAuthStore } from "@/store/useAuthStore";
import AdminHome from "@/views/Home/Admin";
import TechHome from "@/views/Home/Tech";
import UserHome from "@/views/Home/User";

export default function HomePage() {
    const role = useAuthStore((state) => state.getRole());

    const views: Partial<Record<string, React.ReactNode>> = {
        ADMINISTRADOR: <AdminHome />,
        TECNICO: <TechHome />,
        DESARROLLADOR: <TechHome />,
        USUARIO: <UserHome />,
    };

    return <>{views[role] ?? <UserHome />}</>;
}