import { SystemLayout } from "@/components/client/templates/SystemLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SystemLayout>
            {children}
        </SystemLayout>
    );
}