"use client";
import { useRouter } from "next/navigation";
import { ApplicationLoadError } from "@/components/client/organisms/ApplicationLoadError/ApplicationLoadError";
export default function ApplicationError({ reset }: { reset: () => void }) {
    const router = useRouter();
    return (
        <ApplicationLoadError
            onRetry={() => {
                router.refresh();
                reset();
            }}
        />
    );
}
