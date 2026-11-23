import type { ReactNode } from "react";
import { Icon } from "../Icon";

/** Iconos de navegación de la propuesta: contorno legible y acento tenue. */
export function WorkspaceIcon({
    name,
    size = 22,
}: {
    name: string;
    size?: number;
}) {
    const fill = "var(--workspace-icon-accent, #e7edff)";
    const shapes: Record<string, ReactNode> = {
        "house-solid": (
            <>
                <path d="m3 10 9-8 9 8v11H3Z" fill={fill} />
                <path d="M9 21v-8h6v8" />
            </>
        ),
        "ticket-solid": (
            <>
                <path
                    d="M2 5h20v5a2 2 0 0 0 0 4v5H2v-5a2 2 0 0 0 0-4Z"
                    fill={fill}
                />
                <path d="M15 6v3m0 2v2m0 2v3" />
            </>
        ),
        "calendar-week-solid": (
            <>
                <rect x="3" y="5" width="18" height="17" rx="2" fill={fill} />
                <path d="M7 2v6m10-6v6M3 11h18m-13 4h1m3 0h1m3 0h1M8 18h1m3 0h1" />
            </>
        ),
        "table-cells-large-solid": (
            <>
                {[
                    [3, 3],
                    [14, 3],
                    [3, 14],
                    [14, 14],
                ].map(([x, y]) => (
                    <rect
                        key={x + ":" + y}
                        x={x}
                        y={y}
                        width="7"
                        height="7"
                        rx="1"
                        fill={fill}
                    />
                ))}
            </>
        ),
        "chart-pie-solid": (
            <>
                {[
                    [3, 13, 8],
                    [10, 8, 13],
                    [17, 3, 18],
                ].map(([x, y, h]) => (
                    <rect
                        key={x}
                        x={x}
                        y={y}
                        width="4"
                        height={h}
                        rx="1"
                        fill={fill}
                    />
                ))}
            </>
        ),
        file: (
            <>
                <path d="M4 2h10l6 6v14H4Z" fill={fill} />
                <path d="M14 2v7h6M8 13h8m-8 4h8" />
            </>
        ),
        "gavel-solid": (
            <path d="m9 3 9 9-3 3L6 6Zm-4 4 3-3M14 16l4-4M11 11l-8 8M14 21h8m-7-4h6v4h-6Z" fill={fill} />
        ),
        "file-lines-regular": (
            <>
                <rect x="3" y="3" width="18" height="18" rx="2" fill={fill} />
                <rect x="6" y="6" width="5" height="5" rx=".5" fill="white" />
                <path d="M14 7h4m-4 4h4M6 15h12M6 18h8" />
            </>
        ),
        "check-solid": <path d="m4 12 5 5L21 5" />,
        "bell-regular": (
            <>
                <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Z" fill={fill} />
                <path d="M10 21h4M12 2v2" />
            </>
        ),
        help: (
            <>
                <circle cx="12" cy="12" r="10" fill={fill} />
                <path d="M12 11v6m0-11h.01" />
            </>
        ),
        "right-from-bracket-solid": (
            <path d="M11 3H3v18h8M11 12h11m-4-4 4 4-4 4" />
        ),
    };
    if (!shapes[name])
        return <Icon name={name} size={size} color="currentColor" />;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {shapes[name]}
        </svg>
    );
}
