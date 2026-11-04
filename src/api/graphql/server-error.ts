/** Traducir errores de sesión sin devolver query, variables ni stack al navegador. */
export function estadoErrorGraphql(error: unknown): number {
    const e = error as { response?: { status?: number; errors?: { extensions?: { code?: string; status?: number; originalError?: { statusCode?: number } } }[] }; message?: string };
    const extensions = e?.response?.errors?.[0]?.extensions;
    if (extensions?.code === 'UNAUTHENTICATED' || extensions?.originalError?.statusCode === 401 || e?.response?.status === 401 || /Unauthorized|No autorizado/.test(e?.message || '')) return 401;
    if (extensions?.code === 'FORBIDDEN' || extensions?.originalError?.statusCode === 403 || e?.response?.status === 403) return 403;
    return 502;
}

/** Diagnóstico del servidor: solo códigos conocidos, nunca mensajes, URL, SQL o JWT. */
export function diagnosticoErrorGraphql(error: unknown) {
    const record = (value: unknown): Record<string, unknown> =>
        value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
    const root = record(error), response = record(root.response);
    const errors = Array.isArray(response.errors) ? response.errors.slice(0, 20).map(record) : [];
    const knownGraphql = new Set(['UNAUTHENTICATED', 'FORBIDDEN', 'GRAPHQL_VALIDATION_FAILED',
        'GRAPHQL_PARSE_FAILED', 'BAD_USER_INPUT', 'BAD_REQUEST', 'INTERNAL_SERVER_ERROR', 'SERVICE_UNAVAILABLE']);
    const knownTransport = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNREFUSED',
        'ECONNRESET', 'EHOSTUNREACH', 'ENETUNREACH', 'UND_ERR_CONNECT_TIMEOUT',
        'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT', 'CERT_HAS_EXPIRED',
        'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
        'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'ERR_TLS_CERT_ALTNAME_INVALID']);
    const codigosGraphql = [...new Set(errors.map(e => record(e.extensions).code)
        .filter((code): code is string => typeof code === 'string' && knownGraphql.has(code)))];
    const codigosTransporte: string[] = [];
    let cause = root;
    for (let i = 0; i < 4; i++) {
        if (typeof cause.code === 'string' && knownTransport.has(cause.code)) codigosTransporte.push(cause.code);
        cause = record(cause.cause);
    }
    const codigosOracle = [...new Set([root.message, ...errors.map(e => e.message)]
        .filter((message): message is string => typeof message === 'string')
        .flatMap(message => message.match(/ORA-\d{5}/g) || []))];
    const httpOrigen = typeof response.status === 'number' && Number.isInteger(response.status)
        && response.status >= 100 && response.status <= 599 ? response.status : null;
    const status = estadoErrorGraphql(error);
    let tipoFallo = 'NO_CLASIFICADO';
    if (status === 401) tipoFallo = 'SESION';
    else if (status === 403) tipoFallo = 'PERMISO';
    else if (codigosOracle.length) tipoFallo = 'ORACLE';
    else if (root.name === 'AbortError' || root.name === 'TimeoutError'
        || codigosTransporte.some(code => code.includes('TIMEOUT') || code === 'ETIMEDOUT')) tipoFallo = 'TIEMPO_AGOTADO';
    else if (codigosTransporte.some(code => ['ENOTFOUND', 'EAI_AGAIN'].includes(code))) tipoFallo = 'DNS';
    else if (codigosTransporte.some(code => /CERT|TLS|SIGNATURE/.test(code))) tipoFallo = 'TLS';
    else if (codigosTransporte.length) tipoFallo = 'CONEXION';
    else if (codigosGraphql.some(code => ['GRAPHQL_VALIDATION_FAILED', 'GRAPHQL_PARSE_FAILED'].includes(code))) tipoFallo = 'CONTRATO_GRAPHQL';
    else if (root.message === 'RESPUESTA_INICIO_INCOMPLETA') tipoFallo = 'RESPUESTA_INCOMPLETA';
    else if (codigosGraphql.length) tipoFallo = 'GRAPHQL';
    else if (httpOrigen !== null) tipoFallo = 'HTTP';
    else if (root.name === 'SyntaxError') tipoFallo = 'RESPUESTA_NO_JSON';
    return { tipoFallo, httpOrigen, codigosGraphql,
        codigosTransporte: [...new Set(codigosTransporte)], codigosOracle };
}
