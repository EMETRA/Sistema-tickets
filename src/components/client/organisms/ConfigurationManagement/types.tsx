export type ConfigManageView = 
    | "requests"
    | "permissions"
    | "roles"
    | "modules"
    | "enroll";

/**
 * Propiedades del componente ConfigurationManagement.
 */
export interface ConfigurationManagementProps {
    /**
     * Clase CSS adicional.
     */
    className?: string;
    
}