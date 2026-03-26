"use client";

import { ConfigurationManagement } from "@/components/client/organisms/ConfigurationManagement";
import styles from "./Configuration.module.scss";
import { useEffect, useState } from "react";
import { Request } from "@/components/client/organisms/RequestTable/types";
import { Modules } from "@/components/client/organisms/ModulesTable/types";
import { Permissions } from "@/components/client/organisms/PermissionsTable/types";
import { Roles } from "@/components/client/organisms/RolesTable/types";
import { Enroll } from "@/components/client/organisms/EnrollTable/types";
import { getEnrollsDummy, getModulesDummy, getPermissionsDummy, getRequestsDummy, getRolesDummy } from "@/api/graphql/queries/getConfig";
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

    const [requests, setRequests] = useState<Request[]>([]);
    const [modules, setModules] = useState<Modules[]>([]);
    const [permissions, setPermissions] = useState<Permissions[]>([]);
    const [roles, setRoles] = useState<Roles[]>([]);
    const [enrolls, setEnrolls] = useState<Enroll[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError("");

                const [requests, modules, permissions, roles, enrolls] = await Promise.all([
                    getRequestsDummy(),
                    getModulesDummy(),
                    getPermissionsDummy(),
                    getRolesDummy(),
                    getEnrollsDummy()
                ]);

                setRequests(requests);
                setModules(modules);
                setPermissions(permissions);
                setRoles(roles);
                setEnrolls(enrolls);

            } catch (err) {
                setError("No fue posible cargar los datos" + (err instanceof Error ? `: ${err.message}` : ""));
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    },[])

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando datos...</div>
    }

    if (error) {
        return <div className={styles.mainContainer}>{error}</div>
    }

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
                    requests={requests}
                    onRequestApproveAll={(data) => alert(data)}
                    onRequestApprove={(data) => alert(data)}
                    modules={modules}
                    onModulesSubmit={(data) => console.log(data)}
                    onModulesEdit={(data) => console.log(data)}
                    onModulesDelete={(data) => alert(data)}
                    permissions={permissions}
                    onPermissionsSubmit={(data) => console.log(data)}
                    onPermissionsEdit={(data) => console.log(data)}
                    onPermissionsDelete={(data) => alert(data)}
                    roles={roles}
                    onRolesSubmit={(data) => console.log(data)}
                    onRolesEdit={(data) => console.log(data)}
                    onRolesDelete={(data) => alert(data)}
                    enrolls={enrolls}
                    onEnrollApproveAll={(data) => alert(data)}
                    onEnrollApprove={(data) => alert(data)}
                />
            </div>
        </div>
    )
};

export default Configuration;