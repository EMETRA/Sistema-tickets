import { getOperationAST, Kind, parse, valueFromASTUntyped } from "graphql";
import { confirmAdministrativeChange } from "@/api/administrative-confirmation";
import { platformFetch } from "./client";
import { getPlatformRuntime } from "./runtime";
const pending = new Map<string, string>();
function canonical(value: unknown): string {
    if (value instanceof Date) return JSON.stringify(value.toISOString());
    if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
    if (value && typeof value === "object")
        return (
            "{" +
            Object.keys(value)
                .sort()
                .map(
                    (k) =>
                        JSON.stringify(k) +
                        ":" +
                        canonical((value as Record<string, unknown>)[k]),
                )
                .join(",") +
            "}"
        );
    return JSON.stringify(value);
}
export function completeLegacy(headers: Record<string, string>) {
    const id = headers["X-Ticket-Request-Id"];
    if (!id) return;
    for (const [key, value] of pending)
        if (value === id) {
            pending.delete(key);
            try {
                sessionStorage.removeItem("tk-legacy-" + key);
            } catch {}
        }
}
export async function legacyProof(
    path: string,
    args: Record<string, unknown>,
    label: string,
): Promise<Record<string, string>> {
    const runtime = getPlatformRuntime();
    if (!runtime) return {};
    const identity = await import("@/store/useAuthStore");
    const bytes = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
            canonical({
                usuario: identity.useAuthStore.getState().user?.id_usuario,
                path,
                args,
            }),
        ),
    );
    const key = Array.from(new Uint8Array(bytes), (b) =>
        b.toString(16).padStart(2, "0"),
    ).join("");
    let remembered: string | null = null;
    try {
        remembered = sessionStorage.getItem("tk-legacy-" + key);
    } catch {}
    const requestId = pending.get(key) || remembered || crypto.randomUUID();
    pending.set(key, requestId);
    try {
        sessionStorage.setItem("tk-legacy-" + key, requestId);
    } catch {}
    const body = { requestId, args };
    let proof = "";
    if (runtime.actor.admin) {
        await confirmAdministrativeChange(
            {
                label,
                onReview: async () => {
                    proof = (
                        await platformFetch<{ id: string }>(
                            "/confirmations/review",
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    method: "POST",
                                    path,
                                    body,
                                }),
                            },
                        )
                    ).id;
                },
                onConfirm: async () => {
                    await platformFetch(
                        "/confirmations/" + proof + "/confirm",
                        {
                            method: "POST",
                        },
                    );
                },
            },
            true,
        );
    }
    return {
        "X-Ticket-Request-Id": requestId,
        ...(proof ? { "X-Ticket-Confirmation": proof } : {}),
    };
}
export async function graphqlProof(
    query: string,
    variables: Record<string, unknown>,
    label: string,
) {
    const operation = getOperationAST(parse(query));
    if (operation?.operation !== "mutation") return {};
    const fields = operation.selectionSet.selections;
    if (fields.length !== 1 || fields[0].kind !== Kind.FIELD)
        throw new Error("Envía una acción por solicitud.");
    const field = fields[0];
    if (
        ["login", "logout", "refresh", "refreshToken"].includes(
            field.name.value,
        )
    )
        return {};
    const uploads = new Set(
        (operation.variableDefinitions || [])
            .filter((def) => {
                let type = def.type;
                while (type.kind !== Kind.NAMED_TYPE) type = type.type;
                return type.name.value === "Upload";
            })
            .map((def) => def.variable.name.value),
    );
    const args = Object.fromEntries(
        (field.arguments || [])
            .filter(
                (a) =>
                    a.name.value !== "files" &&
                    !(
                        a.value.kind === Kind.VARIABLE &&
                        uploads.has(a.value.name.value)
                    ),
            )
            .map((a) => [a.name.value, valueFromASTUntyped(a.value, variables)])
            .filter(([, v]) => v !== undefined),
    );
    return legacyProof("/graphql/" + field.name.value, args, label);
}
