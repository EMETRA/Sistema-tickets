"use client";

import { useEffect, useState } from "react";
import {
    ConfigManageView,
    ConfigurationManagement,
} from "@/components/client/organisms/ConfigurationManagement";
import { DemoNotice } from "@/components/client/molecules/DemoNotice/DemoNotice";
import {
    getEnrollsDummy,
    getModulesDummy,
    getPermissionsDummy,
    getRequestsDummy,
    getRolesDummy,
} from "@/api/graphql/queries/getConfig";
import { Request } from "@/components/client/organisms/RequestTable/types";
import { Modules } from "@/components/client/organisms/ModulesTable/types";
import { Permissions } from "@/components/client/organisms/PermissionsTable/types";
import { Roles } from "@/components/client/organisms/RolesTable/types";
import { Enroll } from "@/components/client/organisms/EnrollTable/types";
import styles from "./Configuration.module.scss";

// El catálogo heredado sigue siendo de demostración. Ningún identificador de
// estas listas puede utilizarse en mutaciones de usuarios, roles o permisos.
const previewOnly = () => {};

const Configuration: React.FC = () => {
    const [activeView, setActiveView] = useState<ConfigManageView>("requests");
    const [data, setData] = useState<{
    requests: Request[];
    modules: Modules[];
    permissions: Permissions[];
    roles: Roles[];
    enrolls: Enroll[];
  } | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.all([
            getRequestsDummy(),
            getModulesDummy(),
            getPermissionsDummy(),
            getRolesDummy(),
            getEnrollsDummy(),
        ])
            .then(([requests, modules, permissions, roles, enrolls]) => {
                if (active) setData({ requests, modules, permissions, roles, enrolls });
            })
            .catch(() => {
                if (active) setError(true);
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className={styles.mainContainer}>
            <DemoNotice configuration />
            {error ? (
                <p role="alert">No se pudo cargar la vista de demostración.</p>
            ) : !data ? (
                <p role="status">Cargando vista…</p>
            ) : (
                <div className={styles.configContainer}>
                    <ConfigurationManagement
                        {...data}
                        readOnly
                        activeView={activeView}
                        onViewChange={setActiveView}
                        onRequestApprove={previewOnly}
                        onRequestApproveAll={previewOnly}
                        onModulesSubmit={previewOnly}
                        onModulesEdit={previewOnly}
                        onModulesDelete={previewOnly}
                        onPermissionsSubmit={previewOnly}
                        onPermissionsEdit={previewOnly}
                        onPermissionsDelete={previewOnly}
                        onRolesSubmit={previewOnly}
                        onRolesEdit={previewOnly}
                        onRolesDelete={previewOnly}
                        onEnrollApprove={previewOnly}
                        onEnrollApproveAll={previewOnly}
                    />
                </div>
            )}
        </div>
    );
};
export default Configuration;
