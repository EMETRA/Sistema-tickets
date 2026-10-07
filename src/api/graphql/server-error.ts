/** Traducir errores de sesión sin devolver query, variables ni stack al navegador. */
export function estadoErrorGraphql(error: unknown): number {
    const e = error as { response?: { status?: number; errors?: { extensions?: { code?: string; status?: number; originalError?: { statusCode?: number } } }[] }; message?: string };
    const extensions = e?.response?.errors?.[0]?.extensions;
    if (extensions?.code === 'UNAUTHENTICATED' || extensions?.originalError?.statusCode === 401 || e?.response?.status === 401 || /Unauthorized|No autorizado/.test(e?.message || '')) return 401;
    if (extensions?.code === 'FORBIDDEN' || extensions?.originalError?.statusCode === 403 || e?.response?.status === 403) return 403;
    return 502;
}
