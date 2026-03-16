"use client"

import { FilterUsersBar } from "@/components/client/organisms/FilterUsersBar";
import style from "./Users.module.scss";
import { UsersGrid } from "@/components/client/organisms/UsersGrid";
import { UserCardProps } from "@/components/client/molecules/UserCard";
import { useEffect, useState } from "react";
import { getTeamUsersDummy } from "@/api/graphql/queries/getTeamUsers";

const Users: React.FC = () => {

    const [cat, setCat] = useState("todos");
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<UserCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                setError("");

                const data = await getTeamUsersDummy();
                setUsers(data);
            } catch (err) {
                setError("No fue posible cargar los usuarios");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [])

    const filteredUsers = users.filter((user) => {
        
        const matchesCategory = 
            cat === "todos" ||
            (cat === "tecnicos" && user.role.toLowerCase().includes("tecnico")) ||
            (cat === "desarrolladores" && user.role.toLowerCase().includes("desarrollador"));

        const matchesSearch = 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;

    });

    if (isLoading) {
        return <div className={style.mainContainer}>Cargando usuarios...</div>
    }

    if (error) {
        return <div className={style.mainContainer}>{error}</div>
    }

    return (
        <div className={style.mainContainer}>
            <div className={style.teamContainer}>
                <FilterUsersBar 
                    variant="filter-button"
                    searchValue={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={() => {}}
                    selectedCategory={cat}
                    onCategoryChange={setCat}
                    categories={[
                        { label: "Todos", value: "todos" },
                        { label: "Técnicos", value: "tecnicos" },
                        { label: "Desarrolladores", value: "desarrolladores" }
                    ]}
                />
                <div className={style.users}>
                    <UsersGrid 
                        title=""
                        iconName=""
                        users={filteredUsers}
                    />
                </div>
            </div>
        </div>
    );
};

export default Users;