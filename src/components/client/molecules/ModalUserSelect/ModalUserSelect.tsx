"use client";

import React, { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { PopOver } from "@/components/client/atoms/PopOver";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Input } from "@/components/client/atoms/Input";
import { Icon } from "@/components/client/atoms/Icon";
import { UserChip } from "@/components/client/atoms/UserChip";
import { Button } from "@/components/client/atoms/Button";
import { Divider } from "@/components/client/atoms/Divider";
import { useGetUsers } from "@/api/hooks";
import type { User } from "@/api/graphql/users";

import { useAuthStore } from "@/store/useAuthStore";

import { ModalUserSelectProps } from "./types";
import styles from "./ModalUserSelect.module.scss";

export const ModalUserSelect = ({ isOpen, onClose, onConfirm }: ModalUserSelectProps) => {
    const [selectedUserId, setSelectedUserId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    // Término con espera de 300 ms para no filtrar en cada tecla.
    const [debouncedTerm, setDebouncedTerm] = useState("");
    const { data: usersList, loading: isLoadingUsers, error: usersErr } = useGetUsers();
    const usersError = usersErr?.message || "";

    const { getUserId } = useAuthStore();
    const currentUserId = getUserId() || "1";

    useEffect(() => {
        const debounceId = setTimeout(() => setDebouncedTerm(searchTerm.trim().toLowerCase()), 300);
        return () => clearTimeout(debounceId);
    }, [searchTerm]);

    const users: User[] = useMemo(() => {
        const techUsers = usersList.filter((user) => user.rol === "TECNICO" || user.rol === "DESARROLLADOR");
        return debouncedTerm
            ? techUsers.filter(
                  (u) =>
                      u.name.toLowerCase().includes(debouncedTerm) ||
                      u.email.toLowerCase().includes(debouncedTerm),
              )
            : techUsers;
    }, [usersList, debouncedTerm]);
    // La selección solo vale si la persona sigue en la lista filtrada.
    const effectiveSelectedId = users.some((user) => user.id === selectedUserId) ? selectedUserId : "";

    const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (effectiveSelectedId) {
            onConfirm(effectiveSelectedId);
            setSelectedUserId("");
            setSearchTerm("");
        }
    };

    return (
        <PopOver isOpen={isOpen} onClose={onClose} position="center" className={styles.popOver}>
            <div className={styles.modalCard}>
                <div className={styles.header}>
                    <Title variant="mid">Asignar a un usuario</Title>
                    <Text variant="caption">
                        El usuario seleccionado sera asignado a este ticket, se le enviara un correo para
                        informale.
                    </Text>
                    <Input
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        icon={<Icon name="magnifying-glass-solid" variant="status" size={15} />}
                        showIconLeft
                    />
                </div>
                <div className={styles.usersContainer}>
                    {isLoadingUsers && <Text variant="caption">Buscando usuarios...</Text>}
                    {!isLoadingUsers && usersError && <Text variant="caption">{usersError}</Text>}
                    {!isLoadingUsers && !usersError && !users && (
                        <Text variant="caption">No se encontraron usuarios para tu busqueda.</Text>
                    )}
                    {users && users.length > 0
                        ? users.map((user) => (
                              <div
                                  key={user.id}
                                  onClick={() => setSelectedUserId(user.id)}
                                  className={classNames(styles.userItem, {
                                      [styles.selected]: effectiveSelectedId === user.id,
                                  })}
                              >
                                  <UserChip
                                      userName={user.name}
                                      avatarProps={
                                          user.avatar
                                              ? { src: user.avatar }
                                              : { initials: user.name?.charAt(0) ?? "U" }
                                      }
                                  />
                                  {currentUserId === user.id && <Text variant="caption">(Tu)</Text>}
                                  <Text variant="body">{user.email}</Text>
                              </div>
                          ))
                        : !isLoadingUsers && (
                              <Text variant="caption">No se encontraron usuarios para tu busqueda.</Text>
                          )}
                </div>
                <Divider />
                <div className={styles.actions}>
                    <Button variant="outlined" color="cancel" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        state={effectiveSelectedId && !isLoadingUsers ? "default" : "disabled"}
                    >
                        Asignar
                    </Button>
                </div>
            </div>
        </PopOver>
    );
};

export default ModalUserSelect;
