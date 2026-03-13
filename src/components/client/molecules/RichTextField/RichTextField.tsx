import { useRef } from "react";
import { RichTextFieldProps } from "./types";
import styles from "./RichTextField.module.scss";
import { RichTextActions, RichTextToolbar } from "../RichTextToolbar";
import classNames from "classnames";
import { TextArea } from "../../atoms/TextArea";

const RichTextField: React.FC<RichTextFieldProps> = ({
    value,
    onChange,
    className
}) => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const apply = (action: RichTextActions) => {
        
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = value.slice(start, end);

        let wrapped = selected;

        switch (action) {
            case "bold":
                wrapped = `**${selected}**`;
                break;
            case "italic":
                wrapped = `*${selected}*`;
                break;
            case "underline":
                wrapped = `__${selected}__`;
                break;
            case "strike":
                wrapped = `~~${selected}~~`;
                break;
            case "bullet":
                wrapped = `- ${selected}`;
                break;
        }

        onChange( value.slice(0, start) + wrapped + value.slice(end) );

    };

    return (
        <div className={classNames(styles.RichTextField, className)}>

            <RichTextToolbar onAction={apply} />

            <TextArea 
                ref={textareaRef}
                className={styles.textarea}
                value={value}
                onChange={e => onChange(e.target.value)}
            />

        </div>
    );

};

export default RichTextField;