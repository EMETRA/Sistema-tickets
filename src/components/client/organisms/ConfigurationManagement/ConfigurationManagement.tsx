"use client";

import { useState } from "react";
import { ConfigurationManagementProps, ConfigManageView } from "./types";
import styles from "./ConfigurationManagement.module.scss";
import classNames from "classnames";
import { SettingsNavItem } from "../../molecules/SettingsNavItem";
import { RequestTable } from "../RequestTable";
import { RolesTable } from "../RolesTable";
import { ModulesTable } from "../ModulesTable";
import { PermissionsTable } from "../PermissionsTable";
import { EnrollTable } from "../EnrollTable";

const ConfigurationManagement: React.FC<ConfigurationManagementProps> = ({
    requests,
    onRequestApproveAll,
    onRequestApprove,
    modules,
    onModulesSubmit,
    onModulesEdit,
    onModulesDelete,
    permissions,
    onPermissionsSubmit,
    onPermissionsEdit,
    onPermissionsDelete,
    roles,
    onRolesSubmit,
    onRolesEdit,
    onRolesDelete,
    enrolls,
    onEnrollApproveAll,
    onEnrollApprove,
    className
}) => {

    const [view, setView] = useState<ConfigManageView>("requests");

    const renderView = () => {
        switch (view) {
        case "requests":
            return (
                <RequestTable 
                    requests={requests} 
                    onApproveAll={onRequestApproveAll} 
                    onApprove={onRequestApprove} 
                />
            )
        case "modules":
            return (
                <ModulesTable 
                    modules={modules} 
                    onSubmit={onModulesSubmit} 
                    onEdit={onModulesEdit} 
                    onDelete={onModulesDelete}
                />
            )
        case "permissions":
            return (
                <PermissionsTable 
                    permissions={permissions}
                    modules={modules}
                    onSubmit={onPermissionsSubmit}
                    onEdit={onPermissionsEdit}
                    onDelete={onPermissionsDelete}
                />
            )
        case "roles":
            return (
                <RolesTable 
                    roles={roles} 
                    permissions={permissions}
                    onSubmit={onRolesSubmit}
                    onEdit={onRolesEdit}
                    onDelete={onRolesDelete}
                />
            )
        case "enroll":
            return (
                <EnrollTable 
                    enroll={enrolls} 
                    onApproveAll={onEnrollApproveAll}
                    onApprove={onEnrollApprove}
                />
            )
            
        }
    };

    return (
        <div className={classNames(styles.ConfigurationManagement, className)}>
            <div className={styles.sidebar}>

                <SettingsNavItem 
                    label="Aprobar solicitudes"
                    iconName="user-clock-solid"
                    active={view === "requests"}
                    onClick={() => setView("requests")}
                />

                <SettingsNavItem 
                    label="Módulos del sistema"
                    iconName="layer-group-solid"
                    active={view === "modules"}
                    onClick={() => setView("modules")}
                />

                <SettingsNavItem 
                    label="Permisos del sistema"
                    iconName="user-lock-solid"
                    active={view === "permissions"}
                    onClick={() => setView("permissions")}
                />

                <SettingsNavItem 
                    label="Roles del sistema"
                    iconName="user-group-solid"
                    active={view === "roles"}
                    onClick={() => setView("roles")}
                />

                <SettingsNavItem 
                    label="Asignar permisos"
                    iconName="id-badge-solid"
                    active={view === "enroll"}                
                    onClick={() => setView("enroll")}
                />

            </div>
            <div className={styles.content}>
                {renderView()}
            </div>
        </div>
    );

};

export default ConfigurationManagement;