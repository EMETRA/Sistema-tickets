import classNames from "classnames";
import { RequestTableProps } from "./types";
import styles from "./RequestTable.module.scss";
import { TableHeader } from "../../molecules/TableHeader";
import { TableRow } from "../../molecules/TableRow";
import { useState } from "react";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { Chip } from "../../atoms/Chip";
import { IconButton } from "../../atoms/IconButton";
import { Button } from "../../atoms/Button";

const GRID = "minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)";

const RequestTable: React.FC<RequestTableProps> = ({
    requests,
    onApproveAll,
    onApprove,
    className
}) => {

    const [selected, setSelected] = useState<number[]>([]);

    const isAllSelected = selected.length === requests.length;

    const handleSelectAll = (checked: boolean) => {
        setSelected(checked ? requests.map(r => r.id) : [])
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
        onApprove?.(id)
    };

    return (
        <div className={classNames(styles.RequestTable, className)}>

            <div className={styles.header}>

                <TableHeader 
                    iconName="user-clock-solid"
                    label="Solicitudes pendientes"
                />

                <Button onClick={handleApproveAll} state={selected.length === 0 ? "disabled" : "default"}>
                    Aprobar y notificar
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
                        { icon: "user-regular", label: "Nombre y apellido"},
                        { icon: "envelope-regular", label: "Correo"},
                        { icon: "file-lines-regular", label: "No. Empleado"},
                        { icon: "pen-to-square-regular", label: "Renglón"},
                        { icon: "adress-book-regular", label: "Puesto solicitado"},
                        { icon: "spinner-solid", label: "Estado"},
                        { icon: "gears-solid", label: "", align: "center" }
                    ]}
                />

                {requests.map((req) => (
                    <TableRow 
                        key={req.id}
                        id={req.id}
                        selectable
                        isSelected={selected.includes(req.id)}
                        onSelect={(checked) => handleSelectRow(req.id, checked)}
                        gridTemplate={GRID}
                        scale={0.9}
                        cells={[
                            {
                                content: (
                                    <div className={styles.user}>
                                        <Avatar initials={req.name[0]} size="sm" />
                                        <div>
                                            <Text variant="body">{req.name}</Text>
                                        </div>
                                    </div>
                                )
                            },
                            { content: <Text variant="muted">{req.email}</Text>},
                            { content: <Text>{req.employeeNumber}</Text>},
                            { content: <Text>{req.budget}</Text>},
                            { content: <Text>{req.position}</Text>},
                            {
                                content: (
                                    <Chip label={req.status} state="assigned" />
                                ),
                                align: "center"
                            },
                            { 
                                content: (
                                    <IconButton 
                                        icon="paper-plane-solid"
                                        iconColor="#8A8A8A"
                                        onClick={() => handleApprove(req.id)}  
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

export default RequestTable;