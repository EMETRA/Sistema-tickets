"use client";

import React from "react";
import classNames from "classnames";
import { AppCardProps } from "./types";
import styles from "./AppCard.module.scss";
import { AppIcon } from "../AppIcon";
import { IconButton } from "../../atoms/IconButton";
import { Text } from "../../atoms/Text";
import { Button } from "../../atoms/Button";

export const AppCard = ({
  icon,
  iconLabel,
  title,
  bookmarked = false,
  onBookmarkClick,
  onButtonClick,
  iconColor,
  className,
}: AppCardProps) => {
  return (
    <div className={classNames(styles.AppCard, className)}>
      <div className={styles.header}>
        <IconButton
          icon={bookmarked ? 'bookmark-solid-full' : 'bookmark-regular'}
          size={20}
          onClick={onBookmarkClick}
          squared_borded
          className={classNames(styles.bookmarkButton, {
            [styles.bookmarked]: bookmarked,
          })}
        />
      </div>

      <div className={styles.content}>
        <AppIcon icon={icon} label={iconLabel} size={24} color={iconColor} />
        <Text variant="body" className={styles.title}>
          {title}
        </Text>
      </div>

      <div className={styles.divider} />

      <div className={styles.footer}>
        <Button
          variant="text"
          color="cancel"
          icon="arrow-right-solid"
          onClick={onButtonClick}
          className={styles.button}
          fullWidth
        >
          Haga click aquí para ingresar
        </Button>
      </div>
    </div>
  );
};

export default AppCard;
