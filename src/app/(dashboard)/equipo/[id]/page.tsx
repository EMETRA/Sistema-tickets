import Profile from "@/pages/Profile";

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <Profile userId={id} />;
}