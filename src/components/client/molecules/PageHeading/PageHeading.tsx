import styles from "./PageHeading.module.scss";

export function PageHeading({
    title,
    description,
    actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
    return (
        <header className={styles.heading}>
            <div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </header>
    );
}
