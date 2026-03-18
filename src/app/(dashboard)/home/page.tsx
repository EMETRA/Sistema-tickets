"use client";

import { useRole } from "@/context/RoleContext";
import AdminHome from "@/pages/Home/Admin";
import TechHome from "@/pages/Home/Tech";
import UserHome from "@/pages/Home/User";

export default function HomePage() {
    const { role } = useRole();

    const views = {
        admin: <AdminHome />,
        tech: <TechHome />,
        user: <UserHome />,
    };

    return views[role] || <UserHome />;
}   