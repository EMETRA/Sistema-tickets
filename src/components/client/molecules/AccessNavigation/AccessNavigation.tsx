import Link from "next/link";
import { accessNavigation } from "@/platform/access-navigation";
import styles from "./AccessNavigation.module.scss";
export function AccessNavigation({
    active,
    admin,
}: {
    active: string;
    admin: boolean;
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
        </nav>
    );
}
