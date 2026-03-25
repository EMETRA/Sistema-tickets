"use client";

import { ConfigManageView, ConfigurationManagement } from "@/components/client/organisms/ConfigurationManagement";
import styles from "./Configuration.module.scss";
import { useEffect, useState, useCallback } from "react";
import { Request } from "@/components/client/organisms/RequestTable/types";
import { Modules } from "@/components/client/organisms/ModulesTable/types";
import { Permissions } from "@/components/client/organisms/PermissionsTable/types";
import { Roles } from "@/components/client/organisms/RolesTable/types";
import { Enroll } from "@/components/client/organisms/EnrollTable/types";
import { getEnrollsDummy, getModulesDummy, getPermissionsDummy, getRequestsDummy, getRolesDummy } from "@/api/graphql/queries/getConfig";
import { useCreateModule } from "@/api/hooks/useCreateModule"; // Importamos el hook
import { useAssignPermission, useCreateRol } from "@/api/hooks";
const Configuration: React.FC = () => {
    const [activeView, setActiveView] = useState<ConfigManageView>("requests");
    const [requests, setRequests] = useState<Request[]>([]);
    const [modules, setModules] = useState<Modules[]>([]);
    const [permissions, setPermissions] = useState<Permissions[]>([]);
    const [roles, setRoles] = useState<Roles[]>([]);
    const [enrolls, setEnrolls] = useState<Enroll[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { createModule } = useCreateModule();
    const { createRol } = useCreateRol();
    const { assignPermission } = useAssignPermission();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const [requestsData, modulesData, permissionsData, rolesData, enrollsData] = await Promise.all([
                getRequestsDummy(),
                getModulesDummy(),
                getPermissionsDummy(),
                getRolesDummy(),
                getEnrollsDummy()
            ]);

            setRequests(requestsData);
            setModules(modulesData);
            setPermissions(permissionsData);
            setRoles(rolesData);
            setEnrolls(enrollsData);

        } catch (err) {
            setError("No fue posible cargar los datos" + (err instanceof Error ? `: ${err.message}` : ""));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Manejador para crear módulos
    const handleModulesSubmit = async (data: { name: string; description: string }) => {
        try {
        // 2. Mapeamos manualmente al formato CreateModuleInput
            const response = await createModule({
                nombre: data.name,
                descripcion: data.description,
                ruta: `/config`,
            });

            if (response.success) {
                alert("Módulo creado con éxito");
                const updatedModules = await getModulesDummy();
                setModules(updatedModules);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    // Manejador para crear roles
    const handleRolesSubmit = async (data: { name: string; description: string }) => {
        try {
            // Mapeo al formato que espera la Mutation: nombre_rol y descripcion
            const response = await createRol(data.name, data.description);

            if (response.success) {
                alert("Rol creado con éxito");
                
                // Actualizamos la lista de roles (usando tu función dummy por ahora)
                const updatedRoles = await getRolesDummy();
                setRoles(updatedRoles);
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (err) {
            console.error("Error creando rol:", err);
        }
    };

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando datos...</div>
    }

    if (error) {
        return <div className={styles.mainContainer}>{error}</div>
    }

    const handleEnrollApprove = async (userId: number) => {
        try {
            console.log("Aprobar enroll para usuario ID:", userId);
            // Buscamos el permiso que el usuario tiene solicitado en los datos locales
            const userEnroll = enrolls.find(e => e.id === userId);
            const permissionToAssign = userEnroll?.permission ? [userEnroll.permission] : [];

            if (permissionToAssign.length === 0) {
                alert("El usuario no tiene un permiso definido para asignar.");
                return;
            }

            const response = await assignPermission(userId, permissionToAssign);

            if (response.success) {
                alert(`Permisos asignados con éxito a ${userEnroll?.name}`);
                fetchData(); // Refrescamos la tabla
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (err) {
            console.error("Error en assignPermission individual:", err);
        }
    };

    const handleEnrollApproveAll = async (userIds: number[]) => {
        if (userIds.length === 0) {
            alert("No hay usuarios seleccionados.");
            return;
        }

        try {
            setIsLoading(true);

            // Dado que la mutation assignPermission es individual por id_usuario,
            // ejecutamos todas las promesas en paralelo para los IDs seleccionados.
            const promises = userIds.map(userId => {
                const userEnroll = enrolls.find(e => e.id === userId);
                const permission = userEnroll?.permission ? [userEnroll.permission] : [];
                return assignPermission(userId, permission);
            });

            await Promise.all(promises);
            
            alert("Proceso de asignación de usuarios seleccionados completado.");
            fetchData();
        } catch (err) {
            console.error("Error en asignación masiva:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.configContainer}>
                <ConfigurationManagement
                    activeView={activeView}
                    onViewChange={setActiveView}

                    requests={requests}
                    onRequestApproveAll={(data) => alert(data)}
                    onRequestApprove={(data) => alert(data)}
                    
                    // Configuración de Módulos
                    modules={modules}
                    onModulesSubmit={handleModulesSubmit} 
                    onModulesEdit={(data) => console.log(data)}
                    onModulesDelete={(data) => alert(data)}
                    
                    permissions={permissions}
                    onPermissionsSubmit={(data) => console.log(data)}
                    onPermissionsEdit={(data) => console.log(data)}
                    onPermissionsDelete={(data) => alert(data)}
                    
                    roles={roles}
                    onRolesSubmit={handleRolesSubmit}
                    onRolesEdit={(data) => console.log(data)}
                    onRolesDelete={(data) => alert(data)}
                    
                    enrolls={enrolls}
                    onEnrollApprove={handleEnrollApprove}
                    onEnrollApproveAll={handleEnrollApproveAll}
                />
            </div>
        </div>
    )
};

export default Configuration;