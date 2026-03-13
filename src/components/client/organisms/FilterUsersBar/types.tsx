export type FilterBarVariant = "categories" | "filter-button";

export interface FilterUsersBarProps {
    variant: FilterBarVariant;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: () => void;
    // Props para variante 'categories'
    categories?: { label: string; value: string }[];
    selectedCategory?: string;
    onCategoryChange?: (value: string) => void;
    // Props para variante 'filter-button'
    onFilterClick?: () => void;
    className?: string;
}