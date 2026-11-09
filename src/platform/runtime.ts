import type { PlatformContextData } from "./types";
let current: PlatformContextData | null = null;
export function setPlatformRuntime(value: PlatformContextData | null) {
    current = value;
}
export function getPlatformRuntime() {
    return current;
}
