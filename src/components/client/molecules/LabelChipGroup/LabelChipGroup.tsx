import { useMemo, useState, useRef, useEffect } from "react";
import classNames from "classnames";
import type { LabelChipGroupProps, LabelChipGroupRole, LabelOption } from "./types";
import styles from "./LabelChipGroup.module.scss";
import { LabelChip } from "../../atoms/LabelChip";

const EDITABLE_ROLES: LabelChipGroupRole[] = ["tech", "admin"];

export const LabelChipGroup = ({
    labels,
    role,
    availableOptions = [],
    onChange,
    className,
}: LabelChipGroupProps) => {
    const isEditable = EDITABLE_ROLES.includes(role);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const unselectedOptions = useMemo(
        () =>
            availableOptions.filter(
                (opt) => !labels.some((l) => l.value === opt.value)
            ),
        [availableOptions, labels]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAdd = (option: LabelOption) => {
        onChange?.([...labels, option]);
        setIsOpen(false);
    };

    const handleRemove = (value: string) => {
        onChange?.(labels.filter((l) => l.value !== value));
    };

    if (!isEditable) {
        return (
            <div className={classNames(styles.container, className)}>
                <div className={classNames(styles.inputBox, styles.readonly)}>
                    {labels.length === 0 ? (
                        <span className={styles.empty}>Sin etiquetas</span>
                    ) : (
                        labels.map((l) => (
                            <LabelChip
                                key={l.value}
                                label={l.label}
                                variant={l.variant ?? "default"}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={classNames(styles.container, className)}
        >
            <div
                className={classNames(styles.inputBox, { [styles.inputBoxOpen]: isOpen })}
                onClick={() => { if (unselectedOptions.length > 0) setIsOpen((prev) => !prev); }}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (unselectedOptions.length > 0) setIsOpen((prev) => !prev);
                    }
                    if (e.key === "Escape") setIsOpen(false);
                }}
            >
                {labels.map((l) => (
                    <LabelChip
                        key={l.value}
                        label={l.label}
                        variant={l.variant ?? "default"}
                        onRemove={() => handleRemove(l.value)}
                    />
                ))}

                {unselectedOptions.length > 0 && (
                    <span className={styles.placeholder}>Agregar etiqueta...</span>
                )}
            </div>

            {isOpen && unselectedOptions.length > 0 && (
                <ul
                    className={styles.dropdown}
                    role="listbox"
                    aria-label="Opciones de etiqueta"
                >
                    {unselectedOptions.map((opt) => (
                        <li
                            key={opt.value}
                            role="option"
                            aria-selected={false}
                            className={styles.dropdownItem}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAdd(opt);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAdd(opt);
                            }}
                            tabIndex={0}
                        >
                            <LabelChip
                                label={opt.label}
                                variant={opt.variant ?? "default"}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LabelChipGroup;