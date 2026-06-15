"use client";

import { useAuthStore } from "@/store/useAuthStore";
import AdminHome from "@/pages/Home/Admin";
import TechHome from "@/pages/Home/Tech";
import UserHome from "@/pages/Home/User";

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