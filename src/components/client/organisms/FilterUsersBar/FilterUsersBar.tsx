import React from "react";
import { FilterUsersBarProps } from "./types";
import styles from "./FilterUsersBar.module.scss";
import classNames from "classnames";
import { SearchField } from "../../molecules/SearchField";
import { Button } from "../../atoms/Button";

export const FilterUsersBar = ({
    variant,
    searchValue,
    disabled = false,
    onSearchChange,
    onSearchSubmit,
    categories = [],
    selectedCategory,
    onCategoryChange,
    onFilterClick,
    className
}: FilterUsersBarProps) => {
    return (
        <div className={classNames(styles.barContainer, className)}>
            <SearchField 
                value={searchValue}
                onChange={onSearchChange}
                onSearch={onSearchSubmit}
                placeholder="Buscar por nombre"
                className={styles.search}
                disabled={disabled}
            />

            <div className={styles.actions}>
                {variant === "categories" && categories.map((cat) => (
                    <Button
                        key={cat.value}
                        rounded
                        variant={selectedCategory === cat.value ? "contained" : "text"}
                        color={selectedCategory === cat.value ? "default" : "cancel"}
                        onClick={() => onCategoryChange?.(cat.value)}
                        className={styles.catButton}
                        state={disabled ? "disabled" : 'default'}
                    >
                        {cat.label}
                    </Button>
                ))}
                {variant === "filter-button" && (
                    <Button
                        rounded
                        variant="contained"
                        color="default"
                        icon="filter-solid"
                        left
                        onClick={onFilterClick}
                        state={disabled ? "disabled" : 'default'}
                    >
                        Filtrar
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FilterUsersBar;