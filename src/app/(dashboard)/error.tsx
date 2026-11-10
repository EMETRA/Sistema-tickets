"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApplicationLoadError } from "@/components/client/organisms/ApplicationLoadError/ApplicationLoadError";
import { reportRuntimeIncident } from "@/observability/RuntimeIncidents";
export default function DashboardError({ reset }: { reset: () => void }) {
    const router = useRouter();
    useEffect(() => {
        reportRuntimeIncident("REACT_RENDER_ERROR");
    }, []);
    return (
        <ApplicationLoadError
            onRetry={() => {
                router.refresh();
                reset();
            }}
        />
    );
}
