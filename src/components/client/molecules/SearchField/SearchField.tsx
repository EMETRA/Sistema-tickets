"use client";

import classNames from "classnames";
import styles from "./SearchField.module.scss";
import { SearchFieldProps } from "./types";
import { Input } from "../../atoms/Input";
import { IconButton } from "../../atoms/IconButton";

const SearchField: React.FC<SearchFieldProps> = ({
    value,
    placeholder,
    onChange,
    onSearch,
    className
}) => {
    return (
        <form
            className={classNames(styles.SearchField, className)}
            onSubmit={(e) => {
                e.preventDefault();
                onSearch();
            }}
        >
            <div className={styles.inputWrapper}>
                <Input 
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    className={styles.input}
                />

                <IconButton icon="magnifying-glass-solid" type="submit" className={styles.searchButton}/>
            </div>
        </form>
    );
};

export default SearchField;