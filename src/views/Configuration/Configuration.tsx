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
import { useAproveRequest, useAssignPermission, useCreateRol, useUpdateRol } from "@/api/hooks";
import { UpdateRolInput } from "@/api/graphql/rbac";
/**
 import {
    useGetPendingRequests,
    useGetModules,
    useGetPermissions,
    useGetRoles,
    useGetEnrolls,
} from "@/api/hooks";
 */

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
    const { updateRol } = useUpdateRol();
    const { assignPermission } = useAssignPermission();
    const { aproveRequest } = useAproveRequest();

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

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando datos...</div>
    }

    if (error) {
        return <div className={styles.mainContainer}>{error}</div>
    }

    /////////////////////////////////////////// Handlers para HOOKS ///////////////////////////////////////////////////
    const handleModulesSubmit = async (data: { name: string; description: string }) => {
        try {
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

    const handleRolesSubmit = async (data: { name: string; description: string }) => {
        try {
            const response = await createRol(data.name, data.description);
            if (response.success) {
                alert("Rol creado con éxito");
                const updatedRoles = await getRolesDummy();
                setRoles(updatedRoles);
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (err) {
            console.error("Error creando rol:", err);
        }
    };

    const handleRolesEdit = async (data: Roles) => {
        try {
            setIsLoading(true);
            const input: UpdateRolInput = {
                nombre_rol: data.name,
                descripcion: data.description
            };
            const response = await updateRol(data.id, input);

            if (response.success) {
                alert("Rol actualizado correctamente con: " + response.message);
                await fetchData(); 
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (err) {
            console.error("Error al actualizar rol:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnrollApprove = async (userId: number) => {
        try {
            console.log("Aprobar enroll para usuario ID:", userId);
            const userEnroll = enrolls.find(e => e.id === userId);
            const permissionToAssign = userEnroll?.permission ? [userEnroll.permission] : [];

            if (permissionToAssign.length === 0) {
                alert("El usuario no tiene un permiso definido para asignar.");
                return;
            }

            const response = await assignPermission(userId, permissionToAssign);

            if (response.success) {
                alert(`Permisos asignados con éxito a ${userEnroll?.name}`);
                fetchData();
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (err) {
            console.error("Error en assignPermission individual:", err);
        }
    };

    const handleEnrollApproveAll = async (userIds: number[]) => {
        
        try {
            setIsLoading(true);
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

    const handleApproveRequests = async (ids: number | number[]) => {
        if (Array.isArray(ids) && ids.length === 0) {
            alert("No hay usuarios seleccionados.");
            return;
        }
        try {
            setIsLoading(true);
        
            // Normalizamos a array porque la mutation SIEMPRE espera [Int!]!
            const idsArray = Array.isArray(ids) ? ids : [ids];
        
            if (idsArray.length === 0) return;

            const response = await aproveRequest(idsArray);

            if (response.success) {
                alert(response.message || "Solicitudes procesadas con éxito");
                fetchData(); // Refrescamos la lista de pendientes
            }
        } catch (err) {
            console.error("Error al aprobar solicitudes:", err);
        } finally {
            setIsLoading(false);
        }
    };
    /**
    // Hooks para obtener datos de la API
    const { data: pendingRequestsData, loading: loadingRequests, error: errorRequests, refetch: refetchRequests } = useGetPendingRequests();
    const { data: modulesData, loading: loadingModules, error: errorModules, refetch: refetchModules } = useGetModules();
    const { data: permissionsData, loading: loadingPermissions, error: errorPermissions, refetch: refetchPermissions } = useGetPermissions();
    const { data: rolesData, loading: loadingRoles, error: errorRoles, refetch: refetchRoles } = useGetRoles();
    const { data: enrollsData, loading: loadingEnrolls, error: errorEnrolls, refetch: refetchEnrolls } = useGetEnrolls();

    const hasRunOnce = useRef(false);

    useEffect(() => {
        if (!hasRunOnce.current) {
            hasRunOnce.current = true;
            refetchRequests();
            refetchModules();
            refetchPermissions();
            refetchRoles();
            refetchEnrolls();
        }
    }, [refetchRequests, refetchModules, refetchPermissions, refetchRoles, refetchEnrolls]);

    // Derivar estados de carga y error
    const isLoading = loadingRequests || loadingModules || loadingPermissions || loadingRoles || loadingEnrolls;
    const error = (errorRequests || errorModules || errorPermissions || errorRoles || errorEnrolls)
        ? "No fue posible cargar los datos"
        : "";

    // Transformar datos a tipos esperados por ConfigurationManagement
    const requests: Request[] = pendingRequestsData
        ? pendingRequestsData.map(req => ({
            id: req.id_solicitud,
            name: req.nombre || "Sin nombre",
            email: req.email || "Sin email",
            employeeNumber: "", // No disponible en el backend aún (Preguntar a Gerbet si es necesario)
            budget: req.budget?.toString() || "0",
            position: req.position || "Sin posición",
            status: req.estado || "Pendiente",
        }))
        : [];

    const modules: Modules[] = modulesData
        ? modulesData.map(mod => ({
            id: mod.id_modulo,
            name: mod.nombre,
            description: mod.descripcion,
            status: mod.estado,
        }))
        : [];

    const permissions: Permissions[] = permissionsData
        ? permissionsData.map(perm => ({
            id: perm.id_permiso,
            name: perm.nombre,
            module: perm.id_modulo,
            code: perm.codigo,
            description: perm.descripcion,
            status: perm.estado,
            ver: perm.ver,
            grabar: perm.grabar,
            editar: perm.editar,
            eliminar: perm.eliminar,
        }))
        : [];

    const roles: Roles[] = rolesData
        ? rolesData.map(role => ({
            id: role.id_rol,
            code: role.nombre_rol.toUpperCase().replace(/\s+/g, '_'), // Generar código a partir del nombre
            name: role.nombre_rol,
            roleCode: role.nombre_rol.toUpperCase().replace(/\s+/g, '_'),
            description: role.descripcion,
            status: "Activo", // No disponible en el backend aún
            permissions: permissions.slice(0, 3), // DUMMY: Asignar algunos permisos por defecto
        }))
        : [];

    const enrolls: Enroll[] = enrollsData
        ? enrollsData.map(enroll => ({
            id: enroll.id_asignacion,
            name: enroll.nombre,
            department: enroll.departamento,
            employeeNumber: enroll.numero_empleado,
            permission: enroll.permiso,
            status: enroll.estado,
        }))
        : [];
     */

    return (
        <div className={styles.mainContainer}>
            <div className={styles.configContainer}>
                <ConfigurationManagement
                    activeView={activeView}
                    onViewChange={setActiveView}

                    requests={requests}
                    onRequestApprove={(id) => handleApproveRequests(id)}
                    onRequestApproveAll={(selectedIds) => handleApproveRequests(selectedIds)}
                    
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
                    onRolesEdit={handleRolesEdit}
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