"use client";
import { usePlatform } from "@/platform/context";
import { PlatformRoute } from "@/views/Platform/PlatformRoute";
import Configuration from "@/views/Configuration";
export default function ConfigPage() {
    const { disabled } = usePlatform();
    return disabled ? <Configuration /> : <PlatformRoute section="accesos" />;
}
