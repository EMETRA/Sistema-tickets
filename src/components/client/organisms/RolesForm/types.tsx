import { Permissions } from "../PermissionsTable/types";
import { Roles } from "../RolesTable/types";

export interface RolesFormProps {
    permissions: Permissions[];
    initialData?: Roles | null;
    onSubmit?: (data: {name: string; description: string; code: string; permissions: Permissions[]}) => void;
    onCancel?: () => void;
    className?: string;
};