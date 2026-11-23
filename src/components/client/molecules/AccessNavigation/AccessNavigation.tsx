import Link from "next/link";
import { accessNavigation } from "@/platform/access-navigation";
import styles from "./AccessNavigation.module.scss";
export function AccessNavigation({
    active,
    admin,
    corporate = false,
}: {
    active: string;
    admin: boolean;
    corporate?: boolean;
}) {
    return (
        <nav className={styles.navigation} aria-label="Personas y accesos">
            {accessNavigation(admin).map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    aria-current={active === item.id ? "page" : undefined}
                >
                    {item.label}
                </Link>
            ))}
            {!admin && corporate && <Link href="/espacio/accesos?tab=corporate" aria-current={active === "corporate" ? "page" : undefined}>Funciones corporativas</Link>}
        </nav>
    );
}
