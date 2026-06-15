"use client";

import { useCallback } from "react";
import TurnstileWidget from "react-turnstile";
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

/**
 * Componente Turnstile de Cloudflare
 * 
 * Este componente renderiza el widget de captcha Turnstile de Cloudflare.
 * Cuando el usuario lo resuelve, emite el token mediante la callback onSuccess.
 * 
 * Ejemplo de uso:
 * ```tsx
 * const [captchaToken, setCaptchaToken] = useState<string | null>(null);
 * 
 * <Turnstile
 *   onSuccess={(token) => setCaptchaToken(token)}
 *   onError={() => setCaptchaToken(null)}
 *   disabled={isLoading}
 * />
 * ```
 */
export const Turnstile: React.FC<TurnstileProps> = ({
    onSuccess,
    onError,
    onExpire,
    disabled = false,
    className,
}) => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Los hooks DEBEN estar aquí, antes de cualquier early return
    const handleSuccess = useCallback((token: string) => {
        onSuccess(token);
    }, [onSuccess]);

    const handleError = useCallback(() => {
        const errorMsg = "Error validating captcha. Please try again.";
        onError?.(errorMsg);
    }, [onError]);

    const handleExpire = useCallback(() => {
        onExpire?.();
    }, [onExpire]);

    // El check de siteKey va DESPUÉS de los hooks
    if (!siteKey) {
        console.warn(
            "Turnstile site key not found. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local"
        );
        return null;
    }

    return (
        <div className={`${styles.turnstile} ${disabled ? styles.disabled : ""} ${className || ""}`}>
            <TurnstileWidget
                sitekey={siteKey}
                onSuccess={handleSuccess}
                onError={handleError}
                onExpire={handleExpire}
                theme="light"
                appearance="always"
                language="es"
                tabIndex={disabled ? -1 : 0}
            />
        </div>
    );
};

export default Turnstile;
