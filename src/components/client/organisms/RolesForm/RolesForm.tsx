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
import { useEffect, useState } from "react";
import { PermissionToggle } from "../../molecules/PermissionToggle";

const RolesForm: React.FC<RolesFormProps> = ({
    permissions,
    initialData,
    onSubmit,
    onCancel,
    className
}) => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [permissionState, setPermissionState] = useState(
        permissions.map(p => ({
            ...p
        }))
    );

    useEffect(() => {
        if(initialData) {

            setName(initialData.name);
            setDescription(initialData.description || "");
            setCode(initialData.code);

            const selectedIds = initialData.permissions.map(p => p.id);
            setSelected(selectedIds);

            const mergedPermissions = permissions.map(basePerm => {
                const rolePerm = initialData.permissions.find(p => p.id === basePerm.id);
                if (rolePerm) {
                    return {
                        ...basePerm,
                        ver: rolePerm.ver,
                        grabar: rolePerm.grabar,
                        editar: rolePerm.editar,
                        eliminar: rolePerm.eliminar
                    };
                }
                return basePerm;
            });
            setPermissionState(mergedPermissions);
            
        }
    }, [initialData, permissions])

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

    const selectedPermissions = permissionState.filter(p => 
        selected.includes(p.id)
    );

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        onSubmit?.({name, description, code, permissions: selectedPermissions})
    };

    return (
        <div className={classNames(styles.RoleForm, className)}>

            <TableHeader 
                iconName="user-group-solid"
                label="Crear un nuevo rol"
            />

            <div className={styles.form}>
                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Nombre del rol"
                        htmlFor="name"
                        required
                    >
                        <Input 
                            id="name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormField>

                    <FormField
                        label="Código del rol"
                        htmlFor="code"
                        required
                    >
                        <Input 
                            id="code" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </FormField>

                    <FormField
                        label="Descripcion del rol"
                        htmlFor="description"
                    >
                        <TextArea 
                            id="description" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormField>
                    <div className={styles.titleSeparator}>
                        <Title variant="mid">
                            Asignar permisos
                        </Title>
                    </div>
                    <div className={styles.separator}>
                        <Text variant="muted">
                            Los permisos que le asignes al rol, serán los permisos a los que un usuario con este rol tendrá acceso
                        </Text>
                    </div> 
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
                            type="submit"
                        >
                            Grabar
                        </Button>
                    </FormActions>
                </form>
            </div>

        </div>
    );
};

export default RolesForm;