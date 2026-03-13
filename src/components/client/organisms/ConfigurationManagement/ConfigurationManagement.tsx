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

const testRequest = [
    {
        id: 1,
        name: 'Feyser Cáceres',
        email: 'fcaceres@muniguate.com',
        employeeNumber: '2000145',
        budget: '011',
        position: 'Administrador de sistemas',
        status: 'Solicitado'
    },
    {
        id: 2,
        name: 'Gerbert Martinez',
        email: 'gmartinez@muniguate.com',
        employeeNumber: '2024043',
        budget: '011',
        position: 'Admin',
        status: 'Aprobado'
    }
];

const testRoles = [
    {
        id: 1,
        name: 'Administrador del sistema',
        code: '0001',
        roleCode: 'GRPADMIN',
        status: 'Activo'
    },
    {
        id: 2,
        name: 'Usuario regular',
        code: '0002',
        roleCode: 'GRPREGULAR',
        status: 'Baja'
    }
];

const testModules = [
    {
        id: 1,
        name: 'Evial',
        status: 'Activo'
    },
    {
        id: 2,
        name: 'Tickets',
        status: 'Baja'
    }
];

const testPermissions = [
    {
        id: 1,
        name: 'Permiso 1',
        status: 'Activo'
    },
    {
        id: 2,
        name: 'Permiso 2',
        status: 'Baja'
    }
];

const testEnroll = [
    {
        id: 1,
        name: 'Feyser Cáceres',
        department: 'Dirección de informática',
        employeeNumber: '2000145',
        permission: 'Administrador de tickets',
        status: 'Solicitado'
    },
    {
        id: 2,
        name: 'Gerbert Martinez',
        department: 'Dirección de Jurídico',
        employeeNumber: '2024043',
        permission: 'Permisos regulares tickets',
        status: 'Aprobado'
    }
];

const ConfigurationManagement: React.FC<ConfigurationManagementProps> = ({
    className
}) => {

    const [view, setView] = useState<ConfigManageView>("requests");

    const renderView = () => {
        switch (view) {
            case "requests":
                return <RequestTable requests={testRequest} />;
            case "modules":
                return <ModulesTable modules={testModules} />;
            case "permissions":
                return <PermissionsTable permissions={testPermissions}/>;
            case "roles":
                return <RolesTable roles={testRoles} />;
            case "enroll":
                return <EnrollTable enroll={testEnroll} />;
            
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