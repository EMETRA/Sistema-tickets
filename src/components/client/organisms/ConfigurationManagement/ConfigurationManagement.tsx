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
    modules,
    permissions,
    roles,
    enrolls,
    className
}) => {

    const [view, setView] = useState<ConfigManageView>("requests");

    const renderView = () => {
        switch (view) {
            case "requests":
                return <RequestTable requests={requests} onApprove={(select) => alert(select)} />;
            case "modules":
                return <ModulesTable modules={modules} />;
            case "permissions":
                return <PermissionsTable permissions={permissions}/>;
            case "roles":
                return <RolesTable roles={roles} />;
            case "enroll":
                return <EnrollTable enroll={enrolls} />;
            
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