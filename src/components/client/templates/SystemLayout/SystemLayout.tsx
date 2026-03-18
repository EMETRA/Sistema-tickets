"use client";

import { usePathname, useRouter } from "next/navigation";
import { SideBarNavigation } from "../../organisms/SideBarNavigation";
import { TopBar } from "../../organisms/TopBar";
import { PAGES_CONFIG, UserRole } from "@/config/navigation";
import styles from "./SystemLayout.module.scss";
import classNames from "classnames";
import { useState, useMemo } from "react";
import { RoleProvider } from "@/context/RoleContext";

export const SystemLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [currentRole, setCurrentRole] = useState<UserRole>("admin");

    // Buscamos la metadata de la página actual para el TopBar
    const activePage = useMemo(() => {
        // Buscamos en el diccionario qué página coincide con el path actual
        return Object.values(PAGES_CONFIG).find(p => p.path === pathname) || PAGES_CONFIG.home;
    }, [pathname]);

    return (
        <RoleProvider role={currentRole}>
            <div className={classNames(styles.layout, className)}>
                <SideBarNavigation 
                    role={currentRole}
                    activePath={pathname ? pathname : "/home"}
                    onNavigate={(path) => router.push(path)}
                    className={styles.sidebar} 
                />

                <div className={styles.container}>
                    <TopBar 
                        title={activePage.title}
                        iconName={activePage.iconName}
                        userName="Gildder Caceres" 
                        userRole={currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                        userStatus="online"
                        // onSettingsClick={() => router.push("/config")}
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
        </RoleProvider>
    );
};