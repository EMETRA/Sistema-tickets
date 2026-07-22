import { SystemLayout } from "@/components/client/templates/SystemLayout";
import { AppsCatalogProvider } from "@/context/AppsCatalogContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppsCatalogProvider>
            <SystemLayout>{children}</SystemLayout>
        </AppsCatalogProvider>
    );
}
