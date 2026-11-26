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
import { useEffect } from "react";
import { PermissionToggle } from "../../molecules/PermissionToggle";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { texto } from "@/platform/forms";
import type { Permissions } from "../PermissionsTable/types";

const esquema = z.object({
    name: texto("Nombre del rol", { requerido: true, max: 100 }),
    code: texto("Código del rol", { requerido: true, max: 60 }),
    description: texto("Descripción del rol", { max: 500 }),
    selected: z.array(z.number()),
    permissionState: z.array(z.custom<Permissions>()),
});
type Valores = z.infer<typeof esquema>;

/** Permisos del catálogo con los valores (ver, grabar, editar, eliminar) que ya tiene el rol. */
function mergePermissions(permissions: Permissions[], rolePermissions: Permissions[] = []) {
    return permissions.map((basePerm) => {
        const rolePerm = rolePermissions.find((p) => p.id === basePerm.id);
        return rolePerm
            ? {
                  ...basePerm,
                  ver: rolePerm.ver,
                  grabar: rolePerm.grabar,
                  editar: rolePerm.editar,
                  eliminar: rolePerm.eliminar,
              }
            : basePerm;
    });
}

const RolesForm: React.FC<RolesFormProps> = ({ permissions, initialData, onSubmit, onCancel, className }) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm<Valores>({
        resolver: zodResolver(esquema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            selected: [],
            permissionState: permissions.map((p) => ({ ...p })),
        },
    });

    useEffect(() => {
        if (initialData)
            reset({
                name: initialData.name,
                description: initialData.description || "",
                code: initialData.code,
                selected: initialData.permissions.map((p) => p.id),
                permissionState: mergePermissions(permissions, initialData.permissions),
            });
    }, [initialData, permissions, reset]);

    // useWatch (y no watch) es compatible con el compilador de React.
    const selected = useWatch({ control, name: "selected" });
    const permissionState = useWatch({ control, name: "permissionState" });
    const isAllSelected = selected.length === permissions.length;

    const handleSelectAll = (checked: boolean) => {
        setValue("selected", checked ? permissions.map((p) => p.id) : []);
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        setValue("selected", checked ? [...selected, id] : selected.filter((r) => r !== id));
    };

    const handleTogglePermission = (id: number, field: string, value: boolean) => {
        setValue(
            "permissionState",
            permissionState.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
        );
    };

    const submit = handleSubmit((values) =>
        onSubmit?.({
            name: values.name,
            description: values.description,
            code: values.code,
            permissions: values.permissionState.filter((p) => values.selected.includes(p.id)),
        }),
    );

    return (
        <div className={classNames(styles.RoleForm, className)}>
            <TableHeader iconName="user-group-solid" label="Crear un nuevo rol" />

            <div className={styles.form}>
                <form onSubmit={submit} noValidate>
                    <FormField label="Nombre del rol" htmlFor="name" required>
                        <Input
                            id="name"
                            {...register("name")}
                            state={errors.name ? "error" : "default"}
                            errorMessage={errors.name?.message}
                            aria-invalid={!!errors.name}
                        />
                    </FormField>

                    <FormField label="Código del rol" htmlFor="code" required>
                        <Input
                            id="code"
                            {...register("code")}
                            state={errors.code ? "error" : "default"}
                            errorMessage={errors.code?.message}
                            aria-invalid={!!errors.code}
                        />
                    </FormField>

                    <FormField label="Descripcion del rol" htmlFor="description">
                        <TextArea
                            id="description"
                            {...register("description")}
                            state={errors.description ? "error" : "default"}
                            errorMessage={errors.description?.message}
                        />
                    </FormField>
                    <div className={styles.titleSeparator}>
                        <Title variant="mid">Asignar permisos</Title>
                    </div>
                    <div className={styles.separator}>
                        <Text variant="muted">
                            Los permisos que le asignes al rol, serán los permisos a los que un usuario con
                            este rol tendrá acceso
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
                            cells={[{ label: "Nombre del módulo (Modulo usuarios)" }]}
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
                                                <Text variant="body" className={styles.permissionText}>
                                                    {per.name}
                                                </Text>
                                                <Text variant="muted" className={styles.permissionText}>
                                                    {per.description}
                                                </Text>
                                            </div>
                                        ),
                                    },
                                    {
                                        content: (
                                            <PermissionToggle
                                                id={`${per.id}-grabar`}
                                                label="Grabar"
                                                checked={per.grabar}
                                                onChange={(val) =>
                                                    handleTogglePermission(per.id, "grabar", val)
                                                }
                                            />
                                        ),
                                    },
                                    {
                                        content: (
                                            <PermissionToggle
                                                id={`${per.id}-editar`}
                                                label="Editar"
                                                checked={per.editar}
                                                onChange={(val) =>
                                                    handleTogglePermission(per.id, "editar", val)
                                                }
                                            />
                                        ),
                                    },
                                    {
                                        content: (
                                            <PermissionToggle
                                                id={`${per.id}-eliminar`}
                                                label="Eliminar"
                                                checked={per.eliminar}
                                                onChange={(val) =>
                                                    handleTogglePermission(per.id, "eliminar", val)
                                                }
                                            />
                                        ),
                                    },
                                    {
                                        content: (
                                            <PermissionToggle
                                                id={`${per.id}-ver`}
                                                label="Ver"
                                                checked={per.ver}
                                                onChange={(val) => handleTogglePermission(per.id, "ver", val)}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        ))}
                    </div>

                    <FormActions align="center">
                        <Button color="cancel" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit">Grabar</Button>
                    </FormActions>
                </form>
            </div>
        </div>
    );
};

export default RolesForm;
