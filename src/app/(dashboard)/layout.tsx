import { SystemLayout } from "@/components/client/templates/SystemLayout";
import { PlatformProvider } from "@/platform/context";
import { AppsCatalogProvider } from "@/context/AppsCatalogContext";
import { RuntimeIncidents } from '@/observability/RuntimeIncidents';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PlatformProvider>
            <RuntimeIncidents />
            <AppsCatalogProvider>
                <SystemLayout>{children}</SystemLayout>
            </AppsCatalogProvider>
        </PlatformProvider>
    );
}
