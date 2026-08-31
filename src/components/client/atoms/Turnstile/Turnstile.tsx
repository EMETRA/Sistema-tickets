"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Turnstile.module.scss";

/**
 * Props para el componente Turnstile
 */
export interface TurnstileProps {
  /** Callback cuando el captcha se valida exitosamente */
  onSuccess: (token: string) => void;
  /** Callback cuando hay error */
  onError?: (error: string) => void;
  /** Callback cuando el token expira */
  onExpire?: () => void;
  /** Si el componente está deshabilitado */
  disabled?: boolean;
  /** Clase personalizada */
  className?: string;
}

type RemoteTurnstileMessage = {
  type: "turnstile-token";
  token: string;
};

const MIN_TOKEN_LENGTH = 20;
const TURNSTILE_LOAD_ERROR_MESSAGE =
  "No se pudo cargar el captcha. Por favor, intenta de nuevo.";

function parseRemoteMessage(data: unknown): RemoteTurnstileMessage | null {
  let payload: unknown = data;

  if (typeof data === "string") {
    try {
      payload = JSON.parse(data);
    } catch {
      return null;
    }
  }

  if (!payload || typeof payload !== "object") return null;

  const msg = payload as Record<string, unknown>;
  if (msg.type !== "turnstile-token") return null;
  if (typeof msg.token !== "string" || msg.token.length < MIN_TOKEN_LENGTH) {
    return null;
  }

  return { type: "turnstile-token", token: msg.token };
}

function resolveEmbedOrigin(
  embedUrl: string,
  explicitOrigin?: string
): string | null {
  if (explicitOrigin) return explicitOrigin;

  try {
    return new URL(embedUrl).origin;
  } catch {
    return null;
  }
}

function buildIframeSrc(embedUrl: string, parentOrigin: string): string {
  try {
    const url = new URL(embedUrl);
    url.searchParams.set("parentOrigin", parentOrigin);
    return url.toString();
  } catch {
    return embedUrl;
  }
}

/**
 * Turnstile remoto embebido vía iframe (panel-emetra).
 * El token se recibe por postMessage con el contrato `{ type: "turnstile-token", token }`.
 */
export const Turnstile: React.FC<TurnstileProps> = ({
  onSuccess,
  onError,
  onExpire: _onExpire,
  disabled = false,
  className,
}) => {
  const embedUrl = process.env.NEXT_PUBLIC_TURNSTILE_EMBED_URL?.trim() ?? "";
  const embedOrigin = useMemo(() => {
    if (!embedUrl) return null;
    return resolveEmbedOrigin(
      embedUrl,
      process.env.NEXT_PUBLIC_TURNSTILE_EMBED_ORIGIN?.trim()
    );
  }, [embedUrl]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const disabledRef = useRef(disabled);
  const onErrorRef = useRef(onError);

  const [loadError, setLoadError] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    disabledRef.current = disabled;
    onErrorRef.current = onError;
  }, [disabled, onError]);

  useEffect(() => {
    if (!embedOrigin) {
      setIframeSrc(null);
      setLoadError(true);
      onErrorRef.current?.(TURNSTILE_LOAD_ERROR_MESSAGE);
      return;
    }

    setIframeSrc(buildIframeSrc(embedUrl, window.location.origin));
    setLoadError(false);
  }, [embedUrl, embedOrigin]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!embedOrigin || event.origin !== embedOrigin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (disabledRef.current) return;

      const message = parseRemoteMessage(event.data);
      if (!message) return;

      onSuccess(message.token);
    },
    [embedOrigin, onSuccess]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const handleIframeError = useCallback(() => {
    setLoadError(true);
    onErrorRef.current?.(TURNSTILE_LOAD_ERROR_MESSAGE);
  }, []);

  if (!embedOrigin || !iframeSrc) {
    return (
      <div className={`${styles.turnstile} ${className || ""}`}>
        <p className={styles.loadError} role="alert">
          {TURNSTILE_LOAD_ERROR_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.turnstile} ${disabled ? styles.disabled : ""} ${className || ""}`}
    >
      {loadError && (
        <p className={styles.loadError} role="alert">
          {TURNSTILE_LOAD_ERROR_MESSAGE}
        </p>
      )}
      <iframe
        ref={iframeRef}
        className={styles.iframe}
        src={iframeSrc}
        title="Verificación de seguridad Turnstile"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setLoadError(false)}
        onError={handleIframeError}
      />
      {disabled && <div className={styles.overlay} aria-hidden />}
    </div>
  );
};

export default Turnstile;
