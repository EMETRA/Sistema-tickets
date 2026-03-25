import { EnrollTableProps } from "./types";
import styles from "./EnrollTable.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { useState } from "react";
import { TableRow } from "../../molecules/TableRow";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { Chip } from "../../atoms/Chip";
import { IconButton } from "../../atoms/IconButton";
import { Button } from "../../atoms/Button";

const GRID = "minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)";

const EnrollTable: React.FC<EnrollTableProps> = ({
    enroll,
    onApprove,
    onApproveAll,
    className
}) => {

    const [selected, setSelected] = useState<number[]>([]);

    const isAllSelected = selected.length === enroll.length;

    const handleSelectAll = (checked: boolean) => {
        setSelected(checked ? enroll.map(e => e.id) : [])
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        setSelected(prev => 
            checked ? [...prev, id] : prev.filter(r => r !== id)
        );
    };

    const handleApproveAll = () => {
        if (selected.length === 0) return;
        onApproveAll?.(selected);
    };

    const handleApprove = (id: number) => {
        onApprove?.(id);
    };

    return (
        <div className={classNames(styles.EnrollTable, className)}>

            <div className={styles.header}>

                <TableHeader 
                    label="Asignar permisos"
                    iconName="id-badge-solid"
                />

                <Button onClick={handleApproveAll} state={selected.length === 0 ? "disabled" : "default"}>
                    Asignar seleccionados
                </Button>

            </div>

            <div className={styles.table}>

                <TableRow 
                    isHeader
                    selectable
                    isSelected={isAllSelected}
                    onSelect={handleSelectAll}
                    gridTemplate={GRID}
                    cells={[
                        { icon: "user-regular", label: "Nombre y apellido" },
                        { icon: "user-tag-solid", label: "Dirección" },
                        { icon: "file-lines-regular", label: "No. Empleado" },
                        { icon: "adress-book-regular", label: "Permiso solicitado" },
                        { icon: "spinner-solid", label: "Estado" },
                        { icon: "gears-solid", label: "", align: "center" }
                    ]}
                />

                {enroll.map((en) => (
                    <TableRow 
                        key={en.id}
                        id={en.id}
                        selectable
                        isSelected={selected.includes(en.id)}
                        onSelect={(checked) => handleSelectRow(en.id, checked)}
                        gridTemplate={GRID}
                        scale={0.9}
                        cells={[
                            {
                                content: (
                                    <div className={styles.user}>
                                        <Avatar initials={en.name[0]} size="sm" />
                                        <div>
                                            <Text variant="body">{en.name}</Text>
                                        </div>
                                    </div>
                                )
                            },
                            { content: <Text variant="muted">{en.department}</Text> },
                            { content: <Text>{en.employeeNumber}</Text> },
                            { content: <Text>{en.permission}</Text> },
                            { 
                                content: (
                                    <Chip label={en.status} state="ingressed" />
                                ),
                                align: "center"
                            },
                            { 
                                content: (
                                    <IconButton 
                                        icon="paper-plane-solid"
                                        iconColor="#8A8A8A"
                                        onClick={() => handleApprove(en.id)}
                                    />
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

export default EnrollTable;