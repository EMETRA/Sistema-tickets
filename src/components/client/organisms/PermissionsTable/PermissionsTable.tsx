import { Permissions, PermissionsTableProps, PermissionsView } from "./types";
import styles from "./PermissionsTable.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { TableRow } from "../../molecules/TableRow";
import { Text } from "../../atoms/Text";
import { Chip } from "../../atoms/Chip";
import { IconButton } from "../../atoms/IconButton";
import { useState } from "react";
import { PermissionsForm } from "../PermissionsForm";
import { Button } from "../../atoms/Button";
import { ModalContent } from "../../molecules/ModalContent";

const GRID = "minmax(0,1fr) minmax(0,1.8fr) minmax(0,1fr) minmax(0,1fr)";

const PermissionsTable: React.FC<PermissionsTableProps> = ({
    permissions,
    modules,
    onSubmit,
    onEdit,
    onDelete,
    className
}) => {

    const [view, setView] = useState<PermissionsView>("table");
    const [selectedPermission, setSelectedPermission] = useState<Permissions | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState<number>(0);

    if (view === "create") {
        return (
            <PermissionsForm 
                modules={modules}
                onCancel={() => setView("table")}
                onSubmit={(data) => {
                    onSubmit?.(data);
                    setView("table");
                }}
            />
        )
    }

    if (view === "edit") {
        return (
            <PermissionsForm 
                modules={modules}
                initialData={selectedPermission}
                onCancel={() => setView("table")}
                onSubmit={(data) => {

                    if (!selectedPermission) return;

                    const payload = {
                        ...selectedPermission,
                        ...data
                    };

                    onEdit?.(payload);

                    setView("table");

                }}
            />
        )
    }

    return (
        <div className={classNames(styles.PermissionTable, className)}>

            <div className={styles.header}>
                <TableHeader 
                    iconName="user-lock-solid"
                    label="Permisos del sistema"
                />

                <Button onClick={() => setView("create")}>
                    Nuevo
                </Button>
            </div>

            <div className={styles.table}>
                <TableRow 
                    isHeader
                    gridTemplate={GRID}
                    cells={[
                        { icon: "hashtag-solid", label: "Código" },
                        { icon: "clipboard-solid", label: "Nombre del permiso" },
                        { icon: "spinner-solid", label: "Estado" },
                        { icon: "gears-solid", label: "", align: "center" }
                    ]}
                />

                {permissions.map((perm) => (
                    <TableRow 
                        key={perm.id}
                        id={perm.id}
                        gridTemplate={GRID}
                        scale={0.9}
                        cells={[
                            { content: <Text>{perm.id}</Text> },
                            { content: <Text>{perm.name}</Text> },
                            {
                                content: (
                                    <Chip label={perm.status} state="assigned" />
                                ),
                                align: "center"
                            },
                            {
                                content: (
                                    <div>
                                        <IconButton 
                                            icon="file-pen-solid" 
                                            iconColor="#8A8A8A"
                                            onClick={() => {
                                                setSelectedPermission(perm);
                                                setView("edit");
                                            }}
                                        />
                                        <IconButton 
                                            icon="trash-solid" 
                                            iconColor="#8A8A8A"
                                            onClick={() => {
                                                setModalOpen(true);
                                                setSelectedDelete(perm.id);
                                            }}
                                        />
                                    </div>
                                ),
                                align: "center"
                            }
                        ]}
                    />
                ))}

                <ModalContent 
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={() => {
                        onDelete?.(selectedDelete);
                        setModalOpen(false);
                    }}
                    title="¿Estas seguro de querer eliminar este permiso?"
                    description="Esta acción no se podrá revertir"
                />

            </div>

        </div>
    );
};

export default PermissionsTable;