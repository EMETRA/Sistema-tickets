import { useAuthStore } from "@/store/useAuthStore";
import { confirmAdministrativeChange } from "@/api/administrative-confirmation";
export class PlatformError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly reference?: string,
        readonly code?: string,
    ) {
        super(message);
    }
}
export async function platformFetch<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const token = useAuthStore.getState().token;
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", "Bearer " + token);
    if (init.body && !(init.body instanceof FormData))
        headers.set("Content-Type", "application/json");
    const response = await fetch("/api/platform" + path, {
        ...init,
        headers,
        cache: "no-store",
        signal: init.signal || AbortSignal.timeout(45000),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new PlatformError(
            typeof body.message === "string"
                ? body.message
                : "No se pudo completar la operación. Conserva los datos e intenta nuevamente.",
            response.status,
            body.referencia,
            body.codigo,
        );
    }
    if (response.headers.get("content-type")?.includes("application/json"))
        return response.json();
    if (
        !/^\/vivi-pmt\/casos\/[1-9]\d{0,18}\/evidencias\/[1-9]\d{0,18}$/.test(
            path,
        ) &&
        !/^\/boletas\/pdf\?/.test(path) &&
        !/^\/cct\/reportes\/pdf\?/.test(path) &&
        !/^\/cct\/reportes\/cepos\/pdf\?/.test(path) &&
        !/^\/transit-reprints\/N\/[1-9]\d{0,14}\/pdf$/.test(path) &&
        !/^\/files\/[-a-f0-9]+$/.test(path) &&
        !/^\/tickets\/[1-9]\d*\/files\/[1-9]\d*$/.test(path)
    )
        throw new PlatformError(
            "Tickets devolvió un formato inesperado. Conserva los datos y reintenta.",
            502,
        );
    return (await response.blob()) as T;
}
const keys = new Map<string, string>();
function stable(value: unknown): string {
    if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
    if (value && typeof value === "object")
        return (
            "{" +
            Object.keys(value)
                .sort()
                .map(
                    (k) =>
                        JSON.stringify(k) +
                        ":" +
                        stable((value as Record<string, unknown>)[k]),
                )
                .join(",") +
            "}"
        );
    return JSON.stringify(value);
}
async function digest(value: unknown) {
    return Array.from(
        new Uint8Array(
            await crypto.subtle.digest(
                "SHA-256",
                new TextEncoder().encode(stable(value)),
            ),
        ),
    )
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
}
export async function platformCommand<T>(
    path: string,
    method: string,
    payload: Record<string, unknown>,
    admin: boolean,
    label: string,
    form?: FormData,
): Promise<T> {
    const key = await digest({
        usuario: useAuthStore.getState().user?.id_usuario,
        path,
        method,
        payload,
    });
    let requestId = keys.get(key);
    if (!requestId) {
        const remembered = sessionStorage.getItem("tk-command-" + key);
        requestId = remembered || crypto.randomUUID();
        keys.set(key, requestId);
        sessionStorage.setItem("tk-command-" + key, requestId);
    }
    const body = { ...payload, requestId };
    let confirmationId: string | undefined;
    if (admin) {
        await confirmAdministrativeChange(
            {
                label,
                onReview: async () => {
                    const response = await platformFetch<{ id: string }>(
                        "/confirmations/review",
                        {
                            method: "POST",
                            body: JSON.stringify({ path, method, body }),
                        },
                    );
                    confirmationId = response.id;
                },
                onConfirm: async () => {
                    await platformFetch(
                        "/confirmations/" + confirmationId + "/confirm",
                        {
                            method: "POST",
                        },
                    );
                },
            },
            true,
        );
    }
    if (form) form.set("command", JSON.stringify(body));
    const result = await platformFetch<T>(path, {
        method,
        body: form || JSON.stringify(body),
        headers: confirmationId
            ? { "X-Ticket-Confirmation": confirmationId }
            : {},
    });
    keys.delete(key);
    sessionStorage.removeItem("tk-command-" + key);
    return result;
}
export async function downloadPlatform(path: string, name: string) {
    const blob = await platformFetch<Blob>(path),
        url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}
