import { HrNotificationsProvider } from "@/platform/hr-notifications";
import { SystemLayout } from "@/components/client/templates/SystemLayout";
import { PlatformProvider } from "@/platform/context";
import { QueryProvider } from "@/platform/query";
import { AppsCatalogProvider } from "@/context/AppsCatalogContext";
import { RuntimeIncidents } from "@/observability/RuntimeIncidents";
import { WorkspaceViewProvider } from "@/platform/presentation-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <PlatformProvider>
                <WorkspaceViewProvider>
                    <RuntimeIncidents />
                    <AppsCatalogProvider>
                        <HrNotificationsProvider>
                            <SystemLayout>{children}</SystemLayout>
                        </HrNotificationsProvider>
                    </AppsCatalogProvider>
                </WorkspaceViewProvider>
            </PlatformProvider>
        </QueryProvider>
    );
}
