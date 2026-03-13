import { RolesTableProps, RolesView } from "./types";
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

const GRID = "minmax(0, 1fr) minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)";

const testPermissions = [
    {
        id: 1,
        name: 'Permiso 1',
        description: 'Descripcion del permiso si es demasiado largo debera ser cortada',
        grabar: true,
        editar: false,
        eliminar: true,
        ver: true
    },
    {
        id: 2,
        name: 'Permiso 2',
        description: 'Descripcion del permiso si es demasiado largo debera ser cortada',
        grabar: false,
        editar: true,
        eliminar: false,
        ver: true
    }
];

const RolesTable: React.FC<RolesTableProps> = ({
    roles,
    className
}) => {

    const [view, setView] = useState<RolesView>("table");

    if (view === "create") {
        return (
            <RolesForm 
                permissions={testPermissions}
                onCancel={() => setView("table")}
                onSubmit={() => alert("Guardar")}
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

export default RolesTable;