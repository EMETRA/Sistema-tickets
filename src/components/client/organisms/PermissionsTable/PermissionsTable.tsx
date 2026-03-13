import { PermissionsTableProps, PermissionsView } from "./types";
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

const GRID = "minmax(0,1fr) minmax(0,1.8fr) minmax(0,1fr) minmax(0,1fr)";

const PermissionsTable: React.FC<PermissionsTableProps> = ({
    permissions,
    className
}) => {

    const [view, setView] = useState<PermissionsView>("table");

    if (view === "create") {
        return (
            <PermissionsForm 
                modules={[]}
                onCancel={() => setView("table")}
                onSubmit={() => alert("Grabar")}
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
                                        <IconButton icon="trash-solid" />
                                        <IconButton icon="file-pen-solid" />
                                    </div>
                                ),
                                align: "center"
                            }
                        ]}
                    />
                ))}

            </div>

        </div>
    );
};

export default PermissionsTable;