import type { Meta } from "@storybook/nextjs-vite";
import { FilterUsersBar } from "./index";
import { useState } from "react";

const meta: Meta<typeof FilterUsersBar> = {
    title: "Organisms/FilterUsersBar",
    component: FilterUsersBar,
};

export default meta;

export const ConCategorias = () => {
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("todos");

    return (
        <FilterUsersBar 
            variant="categories"
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => console.log("Searching...")}
            selectedCategory={cat}
            onCategoryChange={setCat}
            categories={[
                { label: "Todos", value: "todos" },
                { label: "Tecnicos", value: "tecnicos" },
                { label: "Desarrolladores", value: "desarrolladores" }
            ]}
        />
    );
};

export const ConBotonFiltrar = () => {
    const [search, setSearch] = useState("");

    return (
        <FilterUsersBar 
            variant="filter-button"
            searchValue={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => console.log("Searching...")}
            onFilterClick={() => alert("Abriendo modal de filtros")}
        />
    );
};