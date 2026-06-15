import { Modules } from "../ModulesTable/types";
import { Permissions } from "../PermissionsTable/types";

export interface PermissionsFormProps {
    modules: Modules[];
    initialData?: Permissions | null;
    onSubmit?: (data: {module: number; name: string; code: string; description: string;}) => void;
    onCancel?: () => void;
    className?: string;
}