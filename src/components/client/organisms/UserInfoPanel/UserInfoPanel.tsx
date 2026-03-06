import React from "react";
import { UserInfoPanelProps } from "./types";
import { Text } from "../../atoms/Text";
import styles from "./UserInfoPanel.module.scss";
import classNames from "classnames";
import { Title } from "../../atoms/Title";

export const UserInfoPanel = ({
    locations,
    vacationDays,
    className
}: UserInfoPanelProps) => {
    return (
        <div className={classNames(styles.panelCard, className)}>
            {/* Sección: Lugares a cargo */}
            <div className={styles.section}>
                <Text variant="body" className={styles.label}>
                    Lugares a cargo:
                </Text>
                <div className={styles.chipContainer}>
                    {locations.map((loc, index) => (
                        <div key={index} className={styles.locationChip}>
                            <Text variant="caption" className={styles.locationText}>
                                {loc}
                            </Text>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sección: Vacaciones */}
            <div className={styles.section}>
                <Text variant="body" className={styles.label}>
                    Vacaciones:
                </Text>
                <Title variant="large" className={styles.daysHighlight}>
                    {vacationDays} Días
                </Title>
            </div>
        </div>
    );
};

export default UserInfoPanel;