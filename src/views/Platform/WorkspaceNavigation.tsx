"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export type WorkspaceTab = { id: string; label: string; description: string };
export function useWorkspaceTab(tabs: WorkspaceTab[]) {
    const query = useSearchParams(),
        pathname = usePathname(),
        router = useRouter();
    const current = tabs.find((t) => t.id === query.get("view")) || tabs[0];
    function select(id: string) {
        if(id === current?.id) return;
        const next = new URLSearchParams(query);
        next.set("view", id);
        router.push(pathname + "?" + next.toString(), { scroll: false });
    }
    return { current, select, query };
}
export function WorkspaceNavigation({
    tabs,
    current,
    onSelect,
    label,
}: {
    tabs: WorkspaceTab[];
    current?: WorkspaceTab;
    onSelect: (id: string) => void;
    label: string;
}) {
    return (
        <>
            <nav className={styles.tabs} aria-label={label}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        aria-current={
                            current?.id === tab.id ? "page" : undefined
                        }
                        onClick={() => onSelect(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            {current && <p className={styles.muted}>{current.description}</p>}
        </>
    );
}
