import { Roles, RolesTableProps, RolesView } from "./types";
import styles from "./RolesTable.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { TableRow } from "../../molecules/TableRow";
import { Text } from "../../atoms/Text";
import { Chip } from "../../atoms/Chip";
import { IconButton } from "../../atoms/IconButton";
import { useState } from "react";
import RolesForm from "../RolesForm/RolesForm";
import { Button } from "../../atoms/Button";
import { ModalContent } from "../../molecules/ModalContent";

const GRID = "minmax(0, 1fr) minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)";

const RolesTable: React.FC<RolesTableProps> = ({
    roles,
    permissions,
    onSubmit,
    onEdit,
    onDelete,
    className
}) => {

    const [view, setView] = useState<RolesView>("table");
    const [selectedRole, setSelectedRole] = useState<Roles | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState<number>(0);


    if (view === "create") {
        return (
            <RolesForm 
                permissions={permissions}
                onCancel={() => setView("table")}
                onSubmit={(data) => {
                    onSubmit?.(data);
                    setView("table");
                }}
            />
        );
    }

    if (view === "edit") {
        return (
            <RolesForm
                initialData={selectedRole}
                permissions={permissions}
                onCancel={() => setView("table")}
                onSubmit={(data) => {
                    
                    if (!selectedRole) return;

                    const payload = {
                        ...selectedRole,
                        ...data
                    };

                    onEdit?.(payload);

                    setView("table");

                }}
            />
        );
    }

    return (
        <div className={classNames(styles.RolesTable, className)}>

            <div className={styles.header}>
                <TableHeader 
                    iconName="user-group-solid"
                    label="Roles para el sistema"
                />

                <Button
                    onClick={() => setView("create")}
                >
                    Nuevo
                </Button>
            </div>
            
            <div className={styles.table}>

                <TableRow 
                    isHeader
                    gridTemplate={GRID}
                    cells={[
                        { icon: "hashtag-solid", label: "Código" },
                        { icon: "adress-card-solid", label: "Nombre del rol" },
                        { icon: "file-lines-regular", label: "Código del rol" },
                        { icon: "spinner-solid", label: "Estado" },
                        { icon: "gears-solid", label: "", align: "center" }
                    ]}
                />

                {roles.map((rol) => (
                    <TableRow 
                        key={rol.id}
                        id={rol.id}
                        gridTemplate={GRID}
                        scale={0.9}
                        cells={[
                            { content: <Text>{rol.code}</Text> },
                            { content: <Text>{rol.name}</Text> },
                            { content: <Text>{rol.roleCode}</Text> },
                            {
                                content: (
                                    <Chip label={rol.status} state="ingressed" />
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
                                                setSelectedRole(rol);
                                                setView("edit");
                                            }}
                                        />
                                        <IconButton 
                                            icon="trash-solid" 
                                            iconColor="#8A8A8A"
                                            onClick={() => {
                                                setModalOpen(true);
                                                setSelectedDelete(rol.id);
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
                    title="¿Estas seguro de querer eliminar este rol?"
                    description="Esta acción no se podrá revertir"
                />

            </div>
        </div>
    );
};

export default RolesTable;