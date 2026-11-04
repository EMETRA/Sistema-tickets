import { SystemLayout } from "@/components/client/templates/SystemLayout";
import { PlatformProvider } from "@/platform/context";
import { AppsCatalogProvider } from "@/context/AppsCatalogContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PlatformProvider>
            <AppsCatalogProvider>
                <SystemLayout>{children}</SystemLayout>
            </AppsCatalogProvider>
        </PlatformProvider>
    );
}
