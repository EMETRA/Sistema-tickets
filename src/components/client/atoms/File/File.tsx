import React from "react";

import { Icon } from "@/components/client/atoms/Icon";
import { Text } from "@/components/client/atoms/Text";

import classNames from "classnames";
import styles from "./File.module.scss";
import { FileProps } from "./types";

const File: React.FC<FileProps> = ({ id, name, onClick, className }) => {
    return (
        <div className={classNames(styles.File, className)} onClick={() => onClick(id)}>
            <Icon name="file" variant="status" />
            <Text variant="body">{name}</Text>
        </div>
    );
};

export default File;
