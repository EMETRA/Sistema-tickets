"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import { Markdown } from "tiptap-markdown";
import classNames from "classnames";
import styles from "./MarkdownViewer.module.scss";

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Desactivamos todo lo que no permitimos en el editor
                heading: false,
                codeBlock: false,
                blockquote: false,
                hardBreak: false,
            }),
            Underline,
            Markdown,
            Strike, // Asegurate de tener Strike explícito si StarterKit no lo agarra bien
            Markdown.configure({
                html: true, // 👈 CRUCIAL: Esto permite que procese los tags <u> que vienen del backend
                tightLists: true,
            }),
        ],
        content: content,
        editable: false, // 👈 Bloquea cualquier interacción del teclado
        immediatelyRender: false, // Evita el error de SSR que vimos antes
    });

    if (!editor) return null;

    return (
        <div className={classNames(styles.MarkdownViewer, className)}>
            <EditorContent editor={editor} />
        </div>
    );
};

export default MarkdownViewer;