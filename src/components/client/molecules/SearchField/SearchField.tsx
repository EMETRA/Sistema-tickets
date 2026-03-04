"use client";

import classNames from "classnames";
import styles from "./SearchField.module.scss";
import { SearchFieldProps } from "./types";
import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";

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
            <Input 
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
            />

            <Button type="submit">
                Search
            </Button>
        </form>
    );
};

export default SearchField;