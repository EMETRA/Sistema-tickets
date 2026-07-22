import type { IconName } from "./iconRegistry";

export type { IconName, SvgFileName } from "./iconRegistry";
export {
    ICON_FILES,
    DEFAULT_ICON_FILE,
    resolveIconFile,
    getIconSrc,
    isIconName,
} from "./iconRegistry";

/**
 * Para props que pueden venir tipadas o como string (API / catálogo).
 */
export type IconNameInput = IconName | (string & {});

export type IconVariant = "navigation" | "status" | "action";

export interface IconProps {
    name: IconNameInput;
    variant?: IconVariant;
    size?: number;
    className?: string;
    active?: boolean;
    color?: string;
    backgroundColor?: string;
    raw?: boolean;
}
