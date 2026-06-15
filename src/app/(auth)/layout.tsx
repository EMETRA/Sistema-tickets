export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            margin: 0,
            padding: 0,
        }}>
            <main>
                {children}
            </main>
        </div>
    );
}