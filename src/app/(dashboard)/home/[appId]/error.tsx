"use client";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import { reportRuntimeIncident } from '@/observability/RuntimeIncidents';
import { ApplicationLoadError } from "@/components/client/organisms/ApplicationLoadError/ApplicationLoadError";
export default function ApplicationError({ reset }: { reset: () => void }) {
    const router = useRouter();
    useEffect(() => { reportRuntimeIncident('REACT_RENDER_ERROR'); },[]);
    return (
        <ApplicationLoadError
            onRetry={() => {
                router.refresh();
                reset();
            }}
        />
    );
}
