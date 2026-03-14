"use client"

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
import { AssignableUser, getAssignableUsersDummy } from "@/api/graphql/queries/getAssignableUsers";

import { ModalUserSelectProps } from "./types";
import styles from "./ModalUserSelect.module.scss";

export const ModalUserSelect = ({
  isOpen,
  onClose,
  onConfirm
}: ModalUserSelectProps) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");

  const currentUserId = useMemo(() => {
    // Dummy para obtener el ID del usuario actual desde el contexto o estado global
    return localStorage.getItem("currentUserId") || "1";
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;
    const debounceId = setTimeout(async () => {
      try {
        setIsLoadingUsers(true);
        setUsersError("");
        const fetchedUsers = await getAssignableUsersDummy(searchTerm);

        if (!isCancelled) {
          setUsers(fetchedUsers);
          setSelectedUserId((previousSelectedUserId) => (
            fetchedUsers.some((user) => user.id === previousSelectedUserId)
              ? previousSelectedUserId
              : ""
          ));
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        if (!isCancelled) {
          setUsersError("No fue posible cargar los usuarios.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingUsers(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(debounceId);
    };
  }, [isOpen, searchTerm]);

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedUserId) {
      onConfirm(selectedUserId);
      setSelectedUserId("");
      setSearchTerm("");
    }
  }

  return (
    <PopOver isOpen={isOpen} onClose={onClose} position="center" className={styles.popOver}>
      <div className={styles.modalCard}>
        <div className={styles.header}>
          <Title variant="mid">Asignar a un usuario</Title>
          <Text variant="caption">El usuario seleccionado sera asignado a este ticket, se le enviara un correo para informale.</Text>
          <Input
            placeholder="Buscar"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            icon={<Icon name="magnifying-glass-solid" variant="status" size={15} />}
            showIconLeft
          />
        </div>
        <div className={styles.usersContainer}>
          {isLoadingUsers && !users && <Text variant="caption">Buscando usuarios...</Text>}
          {!isLoadingUsers && usersError && <Text variant="caption">{usersError}</Text>}
          {!isLoadingUsers && !usersError && users.length === 0 && (
            <Text variant="caption">No se encontraron usuarios para tu busqueda.</Text>
          )}
          {users.map((user) => (
            <div key={user.id} onClick={() => setSelectedUserId(user.id)} className={classNames(styles.userItem, { [styles.selected]: selectedUserId === user.id })}>
              <UserChip
              {...user.userInfo}
              />
              {currentUserId === user.id && <Text variant="caption">(Tu)</Text>}
              <Text variant="body">
                {user.workstation}
              </Text>
            </div>
          ))}
        </div>
        <Divider />
        <div className={styles.actions}>
          <Button variant="outlined" color="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} state={selectedUserId && !isLoadingUsers ? "default" : "disabled"}>
            Asignar
          </Button>
        </div>
      </div>
    </PopOver>
  )
}

export default ModalUserSelect;
