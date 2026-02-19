// Inclusión de archivos de logos
/**
 * Definición de los nombres para los tipos de Logos.
 */
type LogoType = "EmetraMain";

/**
 * Interface para las propiedades de los logos.
 */
interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
  name?: LogoType; // Lo hacemos opcional y que por defecto sea EmetraMain
}

/**
 * Mapeo de los logos con sus respectivos nombres.
 */
const LogoMap: Record<LogoType, string> = {
    EmetraMain: "/images/logo-emetra.svg", 
};

export type { LogoProps, LogoType };
export { LogoMap };