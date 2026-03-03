"use client";

import React from "react";
import classNames from "classnames";
import { ProgressRing } from "../../atoms/ProgressRing";
import { ProgressRingStatProps } from "./types";
import styles from "./ProgressRingStat.module.scss";

/**
 * Componente ProgressRingStat - Muestra un anillo de progreso circular con porcentaje y label
 *
 * @param {ProgressRingStatProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente ProgressRingStat renderizado
 */
export const ProgressRingStat: React.FC<ProgressRingStatProps> = ({
  label,
  percentage,
  size = 180,
  strokeWidth = 20,
  className,
}) => {
  // Limitar percentage entre 0 y 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={classNames(styles.ProgressRingStat, className)}>
      <ProgressRing
        percentage={normalizedPercentage}
        size={size}
        strokeWidth={strokeWidth}
        className={styles.RingContainer}
      />
      
      <p className={styles.Label}>{label}</p>
    </div>
  );
};

export default ProgressRingStat;
