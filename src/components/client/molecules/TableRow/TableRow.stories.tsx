import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TableRow } from "./index";
import { Avatar } from "../../atoms/Avatar";
import { Chip } from "../../atoms/Chip";
import { Text } from "../../atoms/Text";
import { IconButton } from "../../atoms/IconButton";
import { AssignedChip } from "../AssignedChip";
import classNames from "classnames";
import styles from "./TableRow.module.scss";

const meta: Meta<typeof TableRow> = {
    title: "Molecules/TableRow",
    component: TableRow,
};

export default meta;
type Story = StoryObj<typeof meta>;

const COMMON_GRID = "minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 0.6fr) minmax(0, 0.9fr) minmax(0, 1.2fr) minmax(0, 1fr)";

export const Header: Story = {
    args: {
        isHeader: true,
        gridTemplate: COMMON_GRID,
        cells: [
            { icon: "user-regular", label: "Usuario" },
            { icon: "clipboard-regular", label: "Titulo" },
            { icon: "file-lines-regular", label: "Descripción" },
            { icon: "calendar-regular", label: "Fecha" },
            { icon: "magnifying-glass-solid", label: "Status Actual" },
            { icon: "circle-user-regular", label: "Asignación" },
            { icon: "hand-regular", label: "Acciones" },
        ]
    }
};

export const DataRow: Story = {
    args: {
        gridTemplate: COMMON_GRID,
        cells: [
                { 
                content:
                    <div className={classNames(styles.userMenu)}>
                        <Avatar 
                            initials={"G"}
                            ringed={false}
                            size="md"
                        />
                
                        <div className={styles.info}>
                            <Text variant="body" className={styles.name}>
                                Gildder Caceres
                            </Text>
                            <Text variant="caption" className={styles.role}>
                                Recursos Humanos  
                            </Text>
                        </div>
                    </div> 
            },
            { content: <Text variant="body" className="{
                
                }">Cancelación Remisión</Text> },
            { content: <Text variant="muted">Remisión errónea a vehículo</Text> },
            { content: <Text variant="muted">Hoy, 17:24</Text> },
            { content: <Chip label="Ingresado" state="assigned" /> },
            { content: <AssignedChip assigned={false} /> },
            { content: <IconButton icon="logout" size={24} /> },
        ]
    }
};

/**
 * Ejemplo de Tabla Completa:
 * Esta historia compone el Header y múltiples DataRows para 
 * visualizar el diseño final de la tabla de tickets.
 */
export const TableExample: Story = {
    render: () => (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%',
            // overflowX: 'auto' // Por si la pantalla es pequeña
        }}>
            {/* Renderizamos el Header usando los mismos args definidos arriba */}
            <TableRow 
                isHeader
                gridTemplate={COMMON_GRID}
                cells={ [
                    { icon: "user-regular", label: "Usuario" },
                    { icon: "clipboard-regular", label: "Titulo" },
                    { icon: "file-lines-regular", label: "Descripción" },
                    { icon: "calendar-regular", label: "Fecha" },
                    { icon: "magnifying-glass-solid", label: "Status Actual" },
                    { icon: "circle-user-regular", label: "Asignación" },
                    { icon: "hand-regular", label: "Acciones" },
                ]}     
            />
            
            
            <TableRow 
                gridTemplate={COMMON_GRID}
                scale={1}
                cells={[
                    { 
                        content:
                            <div className={classNames(styles.userMenu)}>
                                <Avatar initials="F" size="sm"   />
                                <div className={styles.info}>
                                    <Text variant="body" className={styles.name}>
                                        Feyser Emilio Caceres
                                    </Text>
                                    <Text variant="caption" className={styles.role}>
                                        Informática
                                    </Text>
                                </div>
                            </div> 
                    },
                    { content: <Text variant="muted">Solicitud de Mantenimiento</Text> },
                    { content: <Text variant="muted">Mantenimiento a computadora</Text> },
                    { content: <Text variant="muted">Ayer, 14:32</Text> },
                    { content: <Chip label="Asignado" state="assigned" />, align:"center" },
                    { content: <AssignedChip assigned={false} />, align:"center" },
                    { content: <IconButton icon="trash-solid" size={24} iconColor="#BDBDBD" />, align:"center" },
                ]}
            />
        </div>
    )
};