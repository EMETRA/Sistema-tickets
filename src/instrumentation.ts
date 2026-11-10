import type { Instrumentation } from "next";
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { flushPanelIncidents } = await import(
            "@/observability/server-incidents"
        );
        void flushPanelIncidents();
    }
}
export const onRequestError: Instrumentation.onRequestError = async (
    error,
    _request,
    context,
) => {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { queuePanelIncident } = await import(
            "@/observability/server-incidents"
        );
        await queuePanelIncident("Next." + context.routePath, error);
    }
};
