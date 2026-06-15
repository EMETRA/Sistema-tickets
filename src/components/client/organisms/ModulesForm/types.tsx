import { Modules } from "../ModulesTable/types";

export interface ModulesFormProps {
    initialData?: Modules | null;
    onSubmit?: (data: {name: string; description: string}) => void;
    onCancel?: () => void;
    className?: string;
}