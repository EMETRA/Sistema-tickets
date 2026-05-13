"use client"

import React, { useEffect, useMemo, useRef } from "react";
import { FilterUsersBar } from "@/components/client/organisms/FilterUsersBar";
import style from "./Team.module.scss";
import { UsersGrid } from "@/components/client/organisms/UsersGrid";
import { UserCardProps } from "@/components/client/molecules/UserCard";
import { useState } from "react";
import { useGetTeamMembers } from "@/api/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import { useGetDepartments } from "@/api/hooks/useGetDepartments";

const Team: React.FC = () => {
    const [cat, setCat] = useState("todos");
    const [search, setSearch] = useState("");

    const userDepartamento = useAuthStore((state) => state.user?.departamento);
    const { data: departments, loading: loadingDepartments } = useGetDepartments();

    const userDepartmentId = useMemo(() => {
        if (!userDepartamento || !departments.length) return undefined;
        const match = departments.find(
            d => d.nombre_departamento.toLowerCase() === userDepartamento.toLowerCase()
        );
        return match ? parseInt(match.id_departamento, 10) : undefined;
    }, [userDepartamento, departments]);

    const isReady = !loadingDepartments && userDepartmentId !== undefined;

    const { data: teamMembers, loading: isLoading, error: errorMembers } = useGetTeamMembers(
        { id_departamento: userDepartmentId },
        isReady
    );

    if (loadingDepartments || isLoading) {
        return <div className={style.mainContainer}>Cargando usuarios...</div>;
    }


    const error = errorMembers ? "No fue posible cargar los usuarios" : "";

    const users: UserCardProps[] = teamMembers?.map(member => ({
        id: member.id_usuario.toString(),
        name: member.nombre || "Sin nombre",
        email: "Sin email",
        role: member.rol || "Sin rol",
        department: member.departamento || "Sin departamento",
        assignedCount: member.tickets_asignados,
        resolvedCount: member.tickets_resueltos,
    })) || [];

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
                    variant="categories"
                    searchValue={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={() => {}}
                    selectedCategory={cat}
                    onCategoryChange={setCat}
                    // categories={[
                    //     { label: "Todos", value: "todos" },
                    //     { label: "Técnicos", value: "tecnicos" },
                    //     { label: "Desarrolladores", value: "desarrolladores" }
                    // ]}
                    disabled={isLoading || !!error || users.length === 0}
                />
                <div className={style.users}>
                    <UsersGrid 
                        title=""
                        iconName=""
                        users={filteredUsers}
                        pathActive="equipo"
                    />
                </div>
            </div>
        </div>
    );
};

export default Team;