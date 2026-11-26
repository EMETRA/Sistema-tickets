import { PermissionsFormProps } from "./types";
import styles from "./PermissionsForm.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { FormField } from "../../molecules/FormField";
import { SelectField } from "../../molecules/SelectField";
import { Select } from "../../atoms/Select";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mensajes, texto } from "@/platform/forms";

const esquema = z.object({
    module: z.coerce
        .number({ error: mensajes.opcion("Módulo") })
        .int()
        .positive(mensajes.opcion("Módulo")),
    name: texto("Nombre del permiso", { requerido: true, max: 100 }),
    code: texto("Código del permiso", { requerido: true, max: 60 }),
    description: texto("Descripción del permiso", { max: 500 }),
});
type Entrada = z.input<typeof esquema>;
type Valores = z.output<typeof esquema>;

const PermissionsForm: React.FC<PermissionsFormProps> = ({
    modules,
    initialData,
    onSubmit,
    onCancel,
    className,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Entrada, unknown, Valores>({
        resolver: zodResolver(esquema),
        defaultValues: { module: modules[0]?.id ?? 1, name: "", code: "", description: "" },
    });

    const options = modules.map((item) => {
        return { label: item.name, value: item.id };
    });

    useEffect(() => {
        if (initialData)
            reset({
                module: initialData.module,
                name: initialData.name,
                code: initialData.code,
                description: initialData.description || "",
            });
    }, [initialData, reset]);

    return (
        <div className={classNames(styles.PermissionsForm, className)}>
            <TableHeader
                iconName="user-lock-solid"
                label={initialData ? "Editar permiso" : "Crear nuevo permiso"}
            />

            <div className={styles.form}>
                <form onSubmit={handleSubmit((values) => onSubmit?.(values))} noValidate>
                    <SelectField label="Módulo" htmlFor="module" required>
                        <Select id="module" options={options} {...register("module")} />
                    </SelectField>
                    {errors.module && (
                        <p role="alert" className={styles.error}>
                            {errors.module.message}
                        </p>
                    )}

                    <FormField label="Nombre del permiso" htmlFor="name" required>
                        <Input
                            id="name"
                            {...register("name")}
                            state={errors.name ? "error" : "default"}
                            errorMessage={errors.name?.message}
                            aria-invalid={!!errors.name}
                        />
                    </FormField>

                    <FormField label="Código del permiso" htmlFor="code" required>
                        <Input
                            id="code"
                            {...register("code")}
                            state={errors.code ? "error" : "default"}
                            errorMessage={errors.code?.message}
                            aria-invalid={!!errors.code}
                        />
                    </FormField>

                    <FormField label="Descripción del permiso" htmlFor="description">
                        <TextArea
                            id="description"
                            {...register("description")}
                            state={errors.description ? "error" : "default"}
                            errorMessage={errors.description?.message}
                        />
                    </FormField>

                    <FormActions align="center">
                        <Button color="cancel" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit">{initialData ? "Editar" : "Grabar"}</Button>
                    </FormActions>
                </form>
            </div>
        </div>
    );
};

export default PermissionsForm;
