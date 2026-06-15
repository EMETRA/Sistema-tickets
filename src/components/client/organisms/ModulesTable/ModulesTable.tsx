import { Modules, ModulesTableProps, ModulesView } from "./types";
import styles from "./ModulesTable.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { TableRow } from "../../molecules/TableRow";
import { Text } from "../../atoms/Text";
import { Chip } from "../../atoms/Chip";
import { IconButton } from "../../atoms/IconButton";
import { useState } from "react";
import { ModulesForm } from "../ModulesForm";
import { Button } from "../../atoms/Button";
import { ModalContent } from "../../molecules/ModalContent";

const GRID = "minmax(0,1fr) minmax(0,1.8fr) minmax(0,1fr) minmax(0,1fr)";

const ModulesTable: React.FC<ModulesTableProps> = ({
    modules,
    onSubmit,
    onEdit,
    onDelete,
    className
}) => {

    const [view, setView] = useState<ModulesView>("table");
    const [selectedModule, setSelectedModule] = useState<Modules | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState<number>(0);

    if (view === "create") {
        return (
            <ModulesForm 
                onCancel={() => setView("table")}
                onSubmit={(data) => {
                    onSubmit?.(data)
                    setView("table");
                }}
            />
        )
    }

    if (view === "edit") {
        return (
            <ModulesForm 
                initialData={selectedModule}
                onCancel={() => setView("table")}
                onSubmit={(data) => {

                    if (!selectedModule) return;
                    
                    const payload = {
                        ...selectedModule,
                        ...data
                    };

                    onEdit?.(payload)
                    
                    setView("table");
                    
                }}
            />
        )
    }

    return (
        <div className={classNames(styles.ModulesTable, className)}>

            <div className={styles.header}>
                <TableHeader 
                    iconName="layer-group-solid"
                    label="Modulos del sistema"
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
                        { icon: "clipboard-solid", label: "Nombre del módulo" },
                        { icon: "spinner-solid", label: "Estado" },
                        { icon: "gears-solid", label: "", align: "center" }
                    ]}
                />

                {modules.map((mod) => (
                    <TableRow 
                        key={mod.id}
                        id={mod.id}
                        gridTemplate={GRID}
                        scale={0.9}
                        cells={[
                            { content: <Text>{mod.id}</Text> },
                            { content: <Text>{mod.name}</Text> },
                            {
                                content: (
                                    <Chip label={mod.status} state="ingressed" />
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
                                                setSelectedModule(mod);
                                                setView("edit");
                                            }}
                                        />
                                        <IconButton 
                                            icon="trash-solid"
                                            iconColor="#8A8A8A"
                                            onClick={() => {
                                                setModalOpen(true);
                                                setSelectedDelete(mod.id);
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
                    title="¿Estas seguro de querer eliminar este módulo?"
                    description="Esta acción no se podrá revertir"
                />

            </div>
        </div>
    );
};

export default ModulesTable;