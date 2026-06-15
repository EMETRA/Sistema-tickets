"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Markdown } from "tiptap-markdown";
import classNames from "classnames";
import styles from "./RichTextField.module.scss";
import { RichTextFieldProps } from "./types";
import { RichTextToolbar } from "./RichTextToolbar";

interface MarkdownStorage {
    markdown: {
        getMarkdown: () => string;
    };
}

export const RichTextField: React.FC<RichTextFieldProps> = ({ 
    value, 
    onChange, 
    className,
    placeholder 
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                blockquote: false,
            }),
            Underline,
            Markdown.configure({
                bulletListMarker: "-", // Sincronizado con tu preferencia de guiones
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: styles.editorContent,
            },
        },
        onUpdate: ({ editor }) => {
            const storage = editor.storage as unknown as MarkdownStorage;
            const markdown = storage.markdown.getMarkdown();
            onChange(markdown);
        },
    });

    // Sincronización robusta con el estado externo
    useEffect(() => {
        if (!editor) return;
        const storage = editor.storage as unknown as MarkdownStorage;
        const markdown = storage.markdown.getMarkdown();
        
        // Solo actualizamos si el cambio viene de afuera y es distinto
        if (value !== markdown) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className={classNames(styles.RichTextField, className)}>
            <RichTextToolbar editor={editor} />
            <div className={styles.editorContainer}>
                <EditorContent editor={editor} placeholder={placeholder} />
            </div>
        </div>
    );
};

export default RichTextField;