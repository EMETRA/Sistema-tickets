import type { Meta } from "@storybook/nextjs-vite";
import { ModalUserSelect } from "./ModalUserSelect";
import { Button } from "../../atoms/Button";
import { Text } from "../../atoms/Text";
import { useEffect, useState } from "react";
import { AssignableUser, getAssignableUsersDummy } from "@/api/graphql/queries/getAssignableUsers";

const meta: Meta<typeof ModalUserSelect> = {
    title: "Molecules/ModalUserSelect",
    component: ModalUserSelect,
};

export default meta;

export const InteractiveExample = () => {
    const [open, setOpen] = useState(false);
    const [allUsers, setAllUsers] = useState<AssignableUser[]>([]);
    const [assignedUser, setAssignedUser] = useState<AssignableUser | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            const users = await getAssignableUsersDummy();
            setAllUsers(users);
        };

        loadUsers();
    }, []);

    const handleConfirm = (selectedUserId: string) => {
        const user = allUsers.find((item) => item.id === selectedUserId) || null;
        setAssignedUser(user);
        setOpen(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px", padding: "20px" }}>
            <Button onClick={() => setOpen(true)}>Asignar usuario</Button>

            {assignedUser ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Text variant="caption">Usuario asignado:</Text>
                    <Text variant="body"><strong>{assignedUser.userInfo.userName}</strong> — {assignedUser.workstation}</Text>
                </div>
            ) : (
                <Text variant="caption">Sin usuario asignado</Text>
            )}

            <ModalUserSelect
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
            />
        </div>
    );
};
