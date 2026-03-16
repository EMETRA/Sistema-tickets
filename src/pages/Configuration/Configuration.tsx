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
                setError("No fue posible cargar los datos");
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

    return (
        <div className={styles.mainContainer}>
            <div className={styles.configContainer}>
                <ConfigurationManagement 
                    requests={requests}
                    modules={modules}
                    permissions={permissions}
                    roles={roles}
                    enrolls={enrolls}
                />
            </div>
        </div>
    )
};

export default Configuration;