/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { TopBar } from "../../organisms/TopBar";
import { APP_ROUTES, AppPath } from "@/config/routes";
// import { useAuth } from "@/context/AuthContext"; // Descomentar cuando lo tengamos
import styles from "./SystemLayout.module.scss";
import classNames from "classnames";
import { useState } from "react";

export const SystemLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const pathname = usePathname() as AppPath;
    const router = useRouter();
    // const { user } = useAuth(); // Aquí obtendrás el rol real pronto

    const [currentRole, setCurrentRole] = useState<"admin" | "tech" | "user">("admin");
    // Lógica automática de títulos e iconos -- LOGICA TITULOS TOPBAR
    const authorizedRoutes = Object.entries(APP_ROUTES).filter(([, config]) => {
        if (config.roles === 'all') return true;
        return config.roles.includes(currentRole as any);
    });
    return (
        <div className={classNames(styles.layout, className)}>
            <SideBarNavigation 
                role={currentRole}
                activePath={pathname}
                onNavigate={(path) => router.push(path)}
                className={styles.sidebar} 
            />

            <div className={styles.container}>
                <TopBar 
                    title={authorizedRoutes[0]?.[1].title || "Sistema"}
                    iconName={authorizedRoutes[0]?.[1].icon || "ticket-solid"}
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
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                background: '#1a1a1a',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #333',
                color: 'white',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                fontFamily: 'sans-serif'
            }}>
                <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 'bold', opacity: 0.7 }}>
                    MODO DESARROLLO: ROL
                </div>
                <select 
                    value={currentRole} 
                    onChange={(e) => setCurrentRole(e.target.value as "admin" | "tech" | "user")}
                    style={{ 
                        width: '100%',
                        background: '#333', 
                        color: 'white', 
                        border: '1px solid #444', 
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer'
                    }}
                >
                    <option value="admin">Administrador</option>
                    <option value="tech">Técnico</option>
                    <option value="user">Usuario</option>
                </select>
            </div>
        </div>
    );
};