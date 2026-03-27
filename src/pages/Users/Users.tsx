"use client"

import { FilterUsersBar } from "@/components/client/organisms/FilterUsersBar";
import style from "./Users.module.scss";
import { UsersGrid } from "@/components/client/organisms/UsersGrid";
import { UserCardProps } from "@/components/client/molecules/UserCard";
import { useEffect, useState, useRef } from "react";
import { useGetTeamMembers } from "@/api/hooks";

const Users: React.FC = () => {

    const [cat, setCat] = useState("todos");
    const [search, setSearch] = useState("");

    // Hook para obtener miembros del equipo
    const { data: teamMembers, loading: isLoading, error, refetch } = useGetTeamMembers();

    const hasRunOnce = useRef(false);

    useEffect(() => {
        if (!hasRunOnce.current) {
            hasRunOnce.current = true;
            refetch();
        }
    }, [refetch]);

    // Transformar datos del API a UserCardProps[]
    const users: UserCardProps[] = teamMembers
        ? teamMembers.map(member => ({
            id: member.id_usuario.toString(),
            name: member.nombre || "Sin nombre",
            email: member.departamento || "Sin departamento",
            role: member.rol || "Sin rol",
            avatar: undefined,
            assignedCount: member.tickets_asignados,
            resolvedCount: member.tickets_resueltos,
        }))
        : [];

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
        return <div className={style.mainContainer}>No fue posible cargar los usuarios</div>
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
                        pathActive="usuarios"
                    />
                </div>
            </div>
        </div>
    );
};

export default Users;