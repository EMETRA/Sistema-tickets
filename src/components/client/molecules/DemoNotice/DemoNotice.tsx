import styles from "./DemoNotice.module.scss";
export function DemoNotice({
    configuration = false,
}: {
  configuration?: boolean;
}) {
    return (
        <p role="status" className={styles.notice}>
            {configuration
                ? "Vista de demostración de accesos. Estos datos no son el catálogo autorizado y no se pueden aplicar cambios desde esta vista."
                : "Vista de demostración. Los datos mostrados no corresponden a registros reales."}
        </p>
    );
}
