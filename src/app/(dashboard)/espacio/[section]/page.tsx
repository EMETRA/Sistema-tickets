import { PlatformRoute } from "@/views/Platform/PlatformRoute";
import { PLATFORM_SECTIONS } from "@/platform/navigation";
import { notFound } from "next/navigation";
export default async function WorkspacePage({
    params,
}: {
  params: Promise<{ section: string }>;
}) {
    const { section } = await params;
    if (!PLATFORM_SECTIONS.some((s) => s.id === section)) notFound();
    return <PlatformRoute section={section} />;
}
