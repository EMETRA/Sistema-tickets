"use client";

import classNames from "classnames";
import styles from "./RichTextToolbar.module.scss";
import { RichTextActions, RichTextToolbarProps } from "./types";
import { Button } from "../../atoms/Button";

const actions: { action: RichTextActions; label: string} [] = [
    {action: "bold", label: "B"},
    {action: "italic", label: "I"},
    {action: "underline", label: "U"},
    {action: "strike", label: "S"},
    {action: "bullet", label: "•"},
];

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
    onAction,
    className
}) => {
    return (
        <div className={classNames(styles.Toolbar, className)}>
            {actions.map(item => (
                <Button
                    color="cancel"
                    key={item.action}
                    onClick={() => onAction(item.action)}
                >
                    {item.label}
                </Button>
            ))}
        </div>
    );
};

export default RichTextToolbar;