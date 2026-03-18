"use client";

import React, { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import { Icon } from "../../atoms/Icon";
import classNames from "classnames";
import styles from "./RichTextField.module.scss";

export const RichTextToolbar = ({ editor }: { editor: Editor }) => {
    const [, setUpdate] = useState(0);

    useEffect(() => {
        if (!editor) return;

        const handler = () => setUpdate((prev) => prev + 1);
        
        // Escuchamos transacciones para actualizar el estado visual de los botones
        editor.on("transaction", handler);
        return () => { editor.off("transaction", handler); };
    }, [editor]);

    if (!editor) return null;

    const buttons = [
        { icon: "letra-b", action: () => editor.chain().focus().toggleBold().run(), name: "bold" },
        { icon: "fuente-cursiva", action: () => editor.chain().focus().toggleItalic().run(), name: "italic" },
        { icon: "subrayar", action: () => editor.chain().focus().toggleUnderline().run(), name: "underline" },
        { icon: "tachado", action: () => editor.chain().focus().toggleStrike().run(), name: "strike" },
        { icon: "bullet-list", action: () => editor.chain().focus().toggleBulletList().run(), name: "bulletList" },
    ];

    return (
        <div className={styles.toolbar}>
            {buttons.map((btn, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={btn.action}
                    className={classNames(styles.toolBtn, { 
                        [styles.active]: editor.isActive(btn.name) 
                    })}
                >
                    <Icon name={btn.icon} size={10} />
                </button>
            ))}
        </div>
    );
};