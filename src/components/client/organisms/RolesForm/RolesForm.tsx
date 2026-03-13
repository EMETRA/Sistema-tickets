import { RolesFormProps } from "./types";
import styles from "./RolesForm.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { FormField } from "../../molecules/FormField";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";
import { Title } from "../../atoms/Title";
import { Text } from "../../atoms/Text";
import { TableRow } from "../../molecules/TableRow";
import { useState } from "react";
import { PermissionToggle } from "../../molecules/PermissionToggle";

const RolesForm: React.FC<RolesFormProps> = ({
    permissions,
    onSubmit,
    onCancel,
    className
}) => {

    const [selected, setSelected] = useState<number[]>([]);
    const [permissionState, setPermissionState] = useState(
        permissions.map(p => ({
            ...p
        }))
    )

    const isAllSelected = selected.length === permissions.length;

    const handleSelectAll = (checked: boolean) => {
        setSelected(checked ? permissions.map(p => p.id) : [])
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        setSelected(prev => 
            checked ? [...prev, id] : prev.filter(r => r !== id)
        );
    };

    const handleTogglePermission = (id: number, field: string, value: boolean) => {
        setPermissionState(prev =>
            prev.map(p => 
                p.id === id ? {...p, [field]: value } : p
            )
        );
    };

    return (
        <div className={classNames(styles.RoleForm, className)}>

            <TableHeader 
                iconName="user-group-solid"
                label="Crear un nuevo rol"
            />

            <div className={styles.form}>

                <FormField
                    label="Nombre del rol"
                    htmlFor="name"
                    required
                >
                    <Input id="name" />
                </FormField>

                <FormField
                    label="Descripcion del rol"
                    htmlFor="description"
                >
                    <TextArea id="description" />
                </FormField>

                <Title variant="mid">
                    Asignar permisos
                </Title>

                <Text variant="muted">
                    Los permisos que le asignes al rol, serán los permisos a los que un usuario con este rol tendrá acceso
                </Text>

                <div className={styles.table}>
                    <TableRow
                        variant="permission"
                        isHeader
                        selectable
                        isSelected={isAllSelected}
                        onSelect={handleSelectAll}
                        gridTemplate=""
                        cells={[
                            { label: "Nombre del módulo (Modulo usuarios)" }
                        ]}
                    />

                    {permissionState.map((per) => (
                        <TableRow 
                            key={per.id}
                            id={per.id}
                            variant="permission"
                            selectable
                            isSelected={selected.includes(per.id)}
                            onSelect={(checked) => handleSelectRow(per.id, checked)}
                            scale={0.8}
                            gridTemplate=""
                            rowContentClassName={styles.permissionRow}
                            cells={[
                                {
                                    content: (
                                        <div className={styles.permission}>
                                            <Text 
                                                variant="body" 
                                                className={styles.permissionText}
                                            >
                                                {per.name}
                                            </Text>
                                            <Text 
                                                variant="muted" 
                                                className={styles.permissionText}
                                            >
                                                {per.description}
                                            </Text>
                                        </div>
                                    )
                                },
                                {
                                    content: (
                                        <PermissionToggle 
                                            id={`${per.id}-grabar`}
                                            label="Grabar"
                                            checked={per.grabar}
                                            onChange={(val) => handleTogglePermission(per.id, 'grabar', val)}
                                        />
                                    )
                                },
                                {
                                    content: (
                                        <PermissionToggle 
                                            id={`${per.id}-editar`}
                                            label="Editar"
                                            checked={per.editar}
                                            onChange={(val) => handleTogglePermission(per.id, 'editar', val)}
                                        />
                                    )
                                },
                                {
                                    content: (
                                        <PermissionToggle 
                                            id={`${per.id}-eliminar`}
                                            label="Eliminar"
                                            checked={per.eliminar}
                                            onChange={(val) => handleTogglePermission(per.id, 'eliminar', val)}
                                        />
                                    )
                                },
                                {
                                    content: (
                                        <PermissionToggle 
                                            id={`${per.id}-ver`}
                                            label="Ver"
                                            checked={per.ver}
                                            onChange={(val) => handleTogglePermission(per.id, 'ver', val)}
                                        />
                                    )
                                },
                            ]}
                        />
                    ))}

                </div>

                <FormActions align="center">
                    <Button 
                        color="cancel"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onSubmit}
                    >
                        Grabar
                    </Button>
                </FormActions>

            </div>

        </div>
    );
};

export default RolesForm;