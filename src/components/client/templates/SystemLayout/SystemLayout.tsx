"use client";

import { usePathname, useRouter } from "next/navigation";
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { TopBar } from "../../organisms/TopBar";
import { APP_ROUTES, AppPath } from "@/config/routes";
// import { useAuth } from "@/context/AuthContext"; // Descomentar cuando lo tengamos
import styles from "./SystemLayout.module.scss";
import classNames from "classnames";

export const SystemLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const pathname = usePathname() as AppPath;
    const router = useRouter();
    // const { user } = useAuth(); // Aquí obtendrás el rol real pronto

    // Lógica automática de títulos e iconos
    const currentRoute = APP_ROUTES[pathname] || { title: "Sistema", icon: "ticket-solid" };

    return (
        <div className={classNames(styles.layout, className)}>
            <SideBarNavigation 
                role="admin" // 👈 Esto vendrá de user.role
                activePath={pathname}
                onNavigate={(path) => router.push(path)}
                className={styles.sidebar} 
            />

            <div className={styles.container}>
                <TopBar 
                    title={currentRoute.title}
                    iconName={currentRoute.icon}
                    userName="Gildder Caceres" // 👈 Vendrá de user.name
                    userRole="Administrador"
                    userStatus="online"
                    onSettingsClick={() => router.push("/perfil")}
                />

                <main className={styles.main}>
                    <div className={styles.pageContent}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};