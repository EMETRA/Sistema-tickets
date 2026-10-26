

import { useState, useMemo, useEffect } from "react";
import { TableHeader } from "@/components/client/molecules/TableHeader";
import { TableRow } from "@/components/client/molecules/TableRow";
import UserChip from "@/components/client/atoms/UserChip/UserChip";
import { Text } from "@/components/client/atoms/Text";
import { Chip } from "@/components/client/atoms/Chip";
import { IconButton } from "@/components/client/atoms/IconButton";

import styles from "./AnalistsList.module.scss";

type analista = {
	id: string,
	names: string,
	lastNames: string,
	email: string,
	dpi: string,
	nit: string,
	phone: string,
	status: "active" | "inactive"
}

const initialAnalistas: analista[] = [
	{
		id: "1",
		names: "Juan",
		lastNames: "Perez",
		email: "juan.perez@example.com",
		dpi: "1234567890",
		nit: "1234567890",
		phone: "1234567890",
		status: "active"
	},
	{
		id: "2",
		names: "Maria",
		lastNames: "Gomez",
		email: "maria.gomez@example.com",
		dpi: "1234567890",
		nit: "1234567890",
		phone: "1234567890",
		status: "inactive"
	}
]

// const GRID = "minmax(0, 1.6fr) minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 0.7fr) minmax(0, 0.8fr) minmax(0, 1fr)";
const GRID = "minmax(0, 1.6fr) minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr)";

const AnalistsList: React.FC = () => {

    const [analistas, setAnalistas] = useState<analista[]>([]);
    const [analistaEdit, setAnalistaEdit] = useState<analista | null>(null);

    useEffect(() => {
        setAnalistas(initialAnalistas);
    }, []);

    const [selected, setSelected] = useState<string[]>([]);

    const isAllSelected = selected.length === analistas.length;

    const handleSelectAll = (checked: boolean) => {
        setSelected(checked ? analistas.map(a => a.id) : [])
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        setSelected(prev => 
            checked ? [...prev, id.toString()] : prev.filter(a => a !== id.toString())
        );
    };

    const handleEdit = (id: string) => {
        setAnalistaEdit(analistas.find(a => a.id === id) || null);
    };

    const handleToggleStatus = (id: string) => {
        setAnalistas(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    };

    return (
        <div className={styles.mainContainer}>
            <TableHeader 
                iconName="user-group-solid"
                label="Analistas"
            />

            {!analistaEdit ? (

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
                            { icon: "file-lines-regular", label: "DPI"},
                            { icon: "briefcase-solid", label: "NIT"},
                            { icon: "phone-solid", label: "Teléfono"},
                            // { icon: "spinner-solid", label: "Estado"},
                            // { icon: "gears-solid", label: "", align: "center" }
                        ]}
                    />

                    {analistas.map((analista) => (
                        <TableRow 
                            key={analista.id}
                            id={analista.id}
                            selectable
                            isSelected={selected.includes(analista.id)}
                            onSelect={(checked) => handleSelectRow(analista.id, checked)}
                            gridTemplate={GRID}
                            scale={0.9}
                            cells={[
                                {
                                    content: (
                                        <UserChip userName={`${analista.names} ${analista.lastNames}`} avatarProps={{ initials: analista.names[0] }} />
                                    )
                                },
                                { content: <Text >{analista.email}</Text>},
                                { content: <Text>{analista.dpi}</Text>},
                                { content: <Text>{analista.nit}</Text>},
                                { content: <Text>{analista.phone}</Text>},
                                // {
                                //     content: (
                                //         <Chip label={analista.status} variant="outlined" color={analista.status === "active" ? "#008000" : "#FF0000"} />
                                //     ),
                                //     align: "center"
                                // },
                                // { 
                                //     content: (
                                //         <div className={styles.actions}>
                                //             <IconButton 
                                //                 icon="pen-to-square-regular"
                                //                 iconColor="#8A8A8A"
                                //                 onClick={() => handleEdit(analista.id)}  
                                //             />
                                //             <IconButton 
                                //                 icon={analista.status === "active" ? "lock-solid" : "unlock-solid"}
                                //                 iconColor="#8A8A8A"
                                //                 onClick={() => handleToggleStatus(analista.id)}  
                                //             />
                                //         </div>
                                //     ),
                                //     align: "center"
                                // }
                            ]}
                        />
                    ))}

                </div>
            ) : (
                <div className={styles.analistMainContainer}>
                    
                </div>
            )}

        </div>
    );
};

export default AnalistsList;